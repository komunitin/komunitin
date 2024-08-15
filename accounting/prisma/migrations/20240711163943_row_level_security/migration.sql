-- Enable Row Level Security
ALTER TABLE "Account"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AccountTag"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AccountUser"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Currency"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EncryptedSecret"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExternalResource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transfer"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Trustline"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Value"            ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "Account"          FORCE ROW LEVEL SECURITY;
ALTER TABLE "AccountTag"       FORCE ROW LEVEL SECURITY;
ALTER TABLE "AccountUser"      FORCE ROW LEVEL SECURITY;
ALTER TABLE "Currency"         FORCE ROW LEVEL SECURITY;
ALTER TABLE "EncryptedSecret"  FORCE ROW LEVEL SECURITY;
ALTER TABLE "ExternalResource" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Transfer"         FORCE ROW LEVEL SECURITY;
ALTER TABLE "Trustline"        FORCE ROW LEVEL SECURITY;
ALTER TABLE "User"             FORCE ROW LEVEL SECURITY;
ALTER TABLE "Value"            FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "Account"          USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);
CREATE POLICY tenant_isolation_policy ON "AccountTag"       USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);
CREATE POLICY tenant_isolation_policy ON "AccountUser"      USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);
CREATE POLICY tenant_isolation_policy ON "Currency"         USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);
CREATE POLICY tenant_isolation_policy ON "EncryptedSecret"  USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);
CREATE POLICY tenant_isolation_policy ON "ExternalResource" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);
CREATE POLICY tenant_isolation_policy ON "Transfer"         USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);
CREATE POLICY tenant_isolation_policy ON "Trustline"        USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);
CREATE POLICY tenant_isolation_policy ON "User"             USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);
CREATE POLICY tenant_isolation_policy ON "Value"            USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

-- Create policies to bypass RLS
CREATE POLICY bypass_rls_policy ON "Account"          USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "AccountTag"       USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "AccountUser"      USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Currency"         USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "EncryptedSecret"  USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "ExternalResource" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Transfer"         USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Trustline"        USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "User"             USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Value"            USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
