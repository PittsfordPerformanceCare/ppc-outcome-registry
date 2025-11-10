// Simple User Agent Parser
export class UAParser {
  getResult() {
    const ua = navigator.userAgent;
    
    return {
      browser: this.getBrowser(ua),
      os: this.getOS(ua),
      device: this.getDevice(ua),
    };
  }

  getBrowser(ua: string) {
    if (ua.includes('Chrome') && !ua.includes('Edge')) return { name: 'Chrome', version: this.extractVersion(ua, 'Chrome/') };
    if (ua.includes('Safari') && !ua.includes('Chrome')) return { name: 'Safari', version: this.extractVersion(ua, 'Version/') };
    if (ua.includes('Firefox')) return { name: 'Firefox', version: this.extractVersion(ua, 'Firefox/') };
    if (ua.includes('Edge')) return { name: 'Edge', version: this.extractVersion(ua, 'Edg/') };
    return { name: 'Unknown', version: '' };
  }

  getOS(ua: string) {
    if (ua.includes('Windows')) return { name: 'Windows', version: this.extractVersion(ua, 'Windows NT ') };
    if (ua.includes('Mac OS')) return { name: 'macOS', version: this.extractVersion(ua, 'Mac OS X ') };
    if (ua.includes('Linux')) return { name: 'Linux', version: '' };
    if (ua.includes('Android')) return { name: 'Android', version: this.extractVersion(ua, 'Android ') };
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return { name: 'iOS', version: this.extractVersion(ua, 'OS ') };
    return { name: 'Unknown', version: '' };
  }

  getDevice(ua: string) {
    if (ua.includes('Mobile') || ua.includes('iPhone')) return { type: 'mobile', vendor: '', model: '' };
    if (ua.includes('Tablet') || ua.includes('iPad')) return { type: 'tablet', vendor: '', model: '' };
    return { type: 'desktop', vendor: '', model: '' };
  }

  extractVersion(ua: string, prefix: string) {
    const start = ua.indexOf(prefix);
    if (start === -1) return '';
    const version = ua.substring(start + prefix.length);
    const end = version.search(/[^\d.]/);
    return end === -1 ? version : version.substring(0, end);
  }
}
