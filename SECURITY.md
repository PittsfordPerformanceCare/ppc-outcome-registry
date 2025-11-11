# Security Implementation Guide

## User Roles & Authentication

### Architecture

This application implements a secure role-based access control (RBAC) system using:

1. **Separate Roles Table**: User roles are stored in `public.user_roles` table, not on user profiles
2. **Row Level Security (RLS)**: All sensitive tables have RLS policies enforcing access control
3. **Server-Side Validation**: Role checks use database functions with `SECURITY DEFINER`
4. **Automatic Role Assignment**: New users automatically receive the 'clinician' role via trigger

### Available Roles

```typescript
type AppRole = 'admin' | 'clinician' | 'patient';
```

- **admin**: Full access to all data, user management, clinic settings
- **clinician**: Access to own episodes and clinic data
- **patient**: Limited access to own episode data only

### Database Schema

```sql
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'clinician', 'patient');

-- User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);
```

### Security Functions

```sql
-- Check if user has specific role
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Convenience function for admin check
CREATE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;
```

### Client-Side Usage

**✅ CORRECT - Server-side role check:**

```typescript
import { useUserRole } from '@/hooks/useUserRole';

function AdminPanel() {
  const { isAdmin, loading } = useUserRole();
  
  if (loading) return <Spinner />;
  if (!isAdmin) return <Navigate to="/unauthorized" />;
  
  return <AdminContent />;
}
```

**❌ WRONG - Client-side storage (insecure):**

```typescript
// NEVER DO THIS - can be manipulated by attackers!
const isAdmin = localStorage.getItem('isAdmin') === 'true';
const userRole = sessionStorage.getItem('role');
```

### RLS Policy Examples

**Users can view their own roles:**
```sql
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

**Admins can view all roles:**
```sql
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

**Only admins can assign/revoke roles:**
```sql
CREATE POLICY "Admins can assign roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

### Session Management

- **Timeout**: 15 minutes of inactivity
- **Warning**: 2 minutes before timeout
- **Multi-device**: Tracked via `user_sessions` table
- **Revocation**: Sessions can be revoked remotely

### Audit Logging

All sensitive operations are logged to `audit_logs`:
- User who performed action
- Action type (INSERT, UPDATE, DELETE)
- Table name and record ID
- Old and new data (for updates)
- IP address and user agent
- Timestamp

### Best Practices

1. **Always use server-side role checks** - Never trust client-side data
2. **Implement RLS on all sensitive tables** - Default deny access
3. **Use prepared statements** - Prevent SQL injection
4. **Validate all inputs** - Both client and server side
5. **Log security events** - Maintain audit trail
6. **Regular security audits** - Review RLS policies and access patterns

### Testing Security

```typescript
// Test role check
const { data } = await supabase.rpc('has_role', {
  _user_id: userId,
  _role: 'admin'
});
console.log('Is admin:', data);

// Test RLS - should fail for non-admin
const { error } = await supabase
  .from('user_roles')
  .insert({ user_id: someUserId, role: 'admin' });
// Error: new row violates row-level security policy
```

### Compliance

This implementation supports:
- ✅ HIPAA compliance requirements
- ✅ GDPR data access controls
- ✅ SOC 2 audit logging
- ✅ Insurance provider security standards

### Emergency Access

To promote a user to admin (requires database access):

```sql
-- Connect to database with service role
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

### Monitoring

Monitor for security issues:
- Failed login attempts
- Unauthorized access attempts (in audit logs)
- Session anomalies (multiple simultaneous sessions)
- Privilege escalation attempts

### Contact

For security concerns, contact your system administrator or DPO (Data Protection Officer).
