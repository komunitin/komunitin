-- Enable Row Level Security
ALTER TABLE "Currency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EncryptedSecret" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "Currency" FORCE ROW LEVEL SECURITY;
ALTER TABLE "EncryptedSecret" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Account" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "Currency" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);
CREATE POLICY tenant_isolation_policy ON "EncryptedSecret" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);
CREATE POLICY tenant_isolation_policy ON "Account" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

-- Create policies to bypass RLS
CREATE POLICY bypass_rls_policy ON "Currency" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "EncryptedSecret" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Account" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
