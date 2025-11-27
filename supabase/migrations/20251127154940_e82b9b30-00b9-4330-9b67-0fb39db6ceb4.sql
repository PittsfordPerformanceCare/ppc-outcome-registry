-- Add PCP fax number fields to intake_forms and episodes tables
ALTER TABLE intake_forms
ADD COLUMN pcp_fax VARCHAR(20);

ALTER TABLE episodes
ADD COLUMN pcp_fax VARCHAR(20);