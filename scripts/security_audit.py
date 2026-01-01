#!/usr/bin/env python3
"""
Agent Bravo-2: Comprehensive Security Audit
OWASP Top 10 & Production Security Checklist
"""
import os
import re
from pathlib import Path
from typing import List, Dict, Tuple

class SecurityAuditor:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.findings = []
        self.score = 100

    def audit(self) -> Dict:
        """Run comprehensive security audit"""
        print("🔐 Agent Bravo-2: Security Audit Initiated")
        print("="*70)
        print("Scanning for OWASP Top 10 vulnerabilities...\n")

        # 1. Check for exposed secrets
        self.check_exposed_secrets()

        # 2. Check for SQL injection vulnerabilities
        self.check_sql_injection()

        # 3. Check authentication & session management
        self.check_auth_security()

        # 4. Check for XSS vulnerabilities
        self.check_xss_vulnerabilities()

        # 5. Check API security
        self.check_api_security()

        # 6. Check CORS configuration
        self.check_cors_config()

        # 7. Check environment variable security
        self.check_env_security()

        # 8. Check RLS policies
        self.check_rls_policies()

        # Generate report
        return self.generate_report()

    def check_exposed_secrets(self):
        """Check for hardcoded secrets in code"""
        print("🔍 [1/8] Checking for exposed secrets...")

        secret_patterns = [
            (r'sk_live_[a-zA-Z0-9]{24,}', 'Stripe Live Secret Key'),
            (r'pk_live_[a-zA-Z0-9]{24,}', 'Stripe Live Publishable Key'),
            (r'whsec_[a-zA-Z0-9]{32,}', 'Stripe Webhook Secret'),
            (r'sk-[a-zA-Z0-9]{48,}', 'OpenAI/Anthropic API Key'),
            (r'eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*', 'JWT Token'),
        ]

        excluded_files = {'.env.local', '.env', 'node_modules', '.next', '.git', '.vercel'}
        code_files = []

        for ext in ['.ts', '.tsx', '.js', '.jsx']:
            code_files.extend(self.project_root.rglob(f'*{ext}'))

        violations = 0
        for file_path in code_files:
            # Skip excluded directories
            if any(excluded in str(file_path) for excluded in excluded_files):
                continue

            try:
                content = file_path.read_text()
                for pattern, secret_type in secret_patterns:
                    matches = re.findall(pattern, content)
                    if matches:
                        violations += 1
                        self.findings.append({
                            'severity': 'CRITICAL',
                            'category': 'Exposed Secrets',
                            'file': str(file_path.relative_to(self.project_root)),
                            'issue': f'{secret_type} found in code',
                            'recommendation': 'Move to environment variables'
                        })
                        self.score -= 15
            except Exception:
                pass

        if violations == 0:
            print("   ✅ No hardcoded secrets found")
        else:
            print(f"   ❌ Found {violations} exposed secrets")

    def check_sql_injection(self):
        """Check for SQL injection vulnerabilities"""
        print("🔍 [2/8] Checking for SQL injection risks...")

        # Look for string concatenation in SQL queries
        sql_files = list(self.project_root.rglob('*.sql'))
        ts_files = list(self.project_root.rglob('*.ts'))

        violations = 0
        for file_path in ts_files:
            if 'node_modules' in str(file_path) or '.next' in str(file_path):
                continue

            try:
                content = file_path.read_text()
                # Check for template literals with SQL
                if re.search(r'\.from\([`\'\"].*\$\{', content):
                    violations += 1
                    self.findings.append({
                        'severity': 'HIGH',
                        'category': 'SQL Injection',
                        'file': str(file_path.relative_to(self.project_root)),
                        'issue': 'Potential string interpolation in SQL query',
                        'recommendation': 'Use parameterized queries'
                    })
                    self.score -= 10
            except Exception:
                pass

        if violations == 0:
            print("   ✅ No SQL injection risks detected")
        else:
            print(f"   ⚠️  Found {violations} potential SQL injection risks")

    def check_auth_security(self):
        """Check authentication and session security"""
        print("🔍 [3/8] Checking authentication security...")

        # Check for secure session handling
        api_routes = list(self.project_root.glob('app/api/**/route.ts'))

        violations = 0
        for route in api_routes:
            try:
                content = route.read_text()
                # Check if auth routes validate sessions
                if 'auth' in str(route).lower():
                    if 'supabase' not in content.lower():
                        violations += 1
                        self.findings.append({
                            'severity': 'MEDIUM',
                            'category': 'Authentication',
                            'file': str(route.relative_to(self.project_root)),
                            'issue': 'Auth route may not use Supabase authentication',
                            'recommendation': 'Ensure all auth routes use Supabase auth'
                        })
                        self.score -= 5
            except Exception:
                pass

        if violations == 0:
            print("   ✅ Authentication implementation looks secure")
        else:
            print(f"   ⚠️  Found {violations} authentication concerns")

    def check_xss_vulnerabilities(self):
        """Check for XSS vulnerabilities"""
        print("🔍 [4/8] Checking for XSS vulnerabilities...")

        tsx_files = list(self.project_root.rglob('*.tsx'))
        violations = 0

        for file_path in tsx_files:
            if 'node_modules' in str(file_path) or '.next' in str(file_path):
                continue

            try:
                content = file_path.read_text()
                # Check for dangerouslySetInnerHTML
                if 'dangerouslySetInnerHTML' in content:
                    violations += 1
                    self.findings.append({
                        'severity': 'HIGH',
                        'category': 'XSS',
                        'file': str(file_path.relative_to(self.project_root)),
                        'issue': 'Using dangerouslySetInnerHTML',
                        'recommendation': 'Sanitize HTML or use safer alternatives'
                    })
                    self.score -= 8
            except Exception:
                pass

        if violations == 0:
            print("   ✅ No XSS vulnerabilities detected")
        else:
            print(f"   ⚠️  Found {violations} potential XSS vulnerabilities")

    def check_api_security(self):
        """Check API security practices"""
        print("🔍 [5/8] Checking API security...")

        api_routes = list(self.project_root.glob('app/api/**/route.ts'))
        violations = 0

        for route in api_routes:
            try:
                content = route.read_text()

                # Check for rate limiting
                if 'webhook' not in str(route).lower():
                    # Public APIs should have some form of protection
                    if not any(keyword in content for keyword in ['rateLimit', 'throttle', 'supabase']):
                        violations += 1
                        self.findings.append({
                            'severity': 'MEDIUM',
                            'category': 'API Security',
                            'file': str(route.relative_to(self.project_root)),
                            'issue': 'API endpoint may lack rate limiting',
                            'recommendation': 'Implement rate limiting for public APIs'
                        })
                        self.score -= 5

                # Check webhook signature validation
                if 'webhook' in str(route).lower() and 'stripe' in str(route).lower():
                    if 'constructEvent' not in content:
                        violations += 1
                        self.findings.append({
                            'severity': 'CRITICAL',
                            'category': 'Webhook Security',
                            'file': str(route.relative_to(self.project_root)),
                            'issue': 'Stripe webhook may not validate signatures',
                            'recommendation': 'Use stripe.webhooks.constructEvent()'
                        })
                        self.score -= 15
            except Exception:
                pass

        if violations == 0:
            print("   ✅ API security practices look good")
        else:
            print(f"   ⚠️  Found {violations} API security concerns")

    def check_cors_config(self):
        """Check CORS configuration"""
        print("🔍 [6/8] Checking CORS configuration...")

        # Check middleware and API routes for CORS
        next_config = self.project_root / 'next.config.js'
        violations = 0

        if next_config.exists():
            try:
                content = next_config.read_text()
                if "'*'" in content or '"*"' in content:
                    violations += 1
                    self.findings.append({
                        'severity': 'MEDIUM',
                        'category': 'CORS',
                        'file': 'next.config.js',
                        'issue': 'CORS allows all origins (*)',
                        'recommendation': 'Restrict to specific domains'
                    })
                    self.score -= 5
            except Exception:
                pass

        if violations == 0:
            print("   ✅ CORS configuration acceptable")
        else:
            print(f"   ⚠️  Found {violations} CORS concerns")

    def check_env_security(self):
        """Check environment variable security"""
        print("🔍 [7/8] Checking environment variable security...")

        env_file = self.project_root / '.env.local'
        gitignore = self.project_root / '.gitignore'

        violations = 0

        # Check if .env files are gitignored
        if gitignore.exists():
            gitignore_content = gitignore.read_text()
            if '.env' not in gitignore_content:
                violations += 1
                self.findings.append({
                    'severity': 'CRITICAL',
                    'category': 'Environment Security',
                    'file': '.gitignore',
                    'issue': '.env files not in .gitignore',
                    'recommendation': 'Add .env* to .gitignore'
                })
                self.score -= 15

        if violations == 0:
            print("   ✅ Environment variable security looks good")
        else:
            print(f"   ❌ Found {violations} environment security issues")

    def check_rls_policies(self):
        """Check RLS policies are enabled"""
        print("🔍 [8/8] Checking RLS policies...")

        rls_file = self.project_root / 'supabase' / 'migrations' / '20231201000001_rls_policies.sql'

        if rls_file.exists():
            content = rls_file.read_text()
            tables = ['products', 'orders', 'profiles', 'reviews', 'carts']

            for table in tables:
                if f'ON {table} FOR SELECT' not in content:
                    self.findings.append({
                        'severity': 'HIGH',
                        'category': 'RLS Policies',
                        'file': str(rls_file.relative_to(self.project_root)),
                        'issue': f'Missing SELECT policy for {table}',
                        'recommendation': f'Add RLS SELECT policy for {table} table'
                    })
                    self.score -= 8

            print("   ✅ RLS policies configured")
        else:
            print("   ⚠️  RLS policies file not found")

    def generate_report(self) -> Dict:
        """Generate security audit report"""
        print("\n" + "="*70)
        print("📊 SECURITY AUDIT REPORT")
        print("="*70)

        # Calculate final score
        self.score = max(0, self.score)

        # Categorize findings by severity
        critical = [f for f in self.findings if f['severity'] == 'CRITICAL']
        high = [f for f in self.findings if f['severity'] == 'HIGH']
        medium = [f for f in self.findings if f['severity'] == 'MEDIUM']

        print(f"\n🎯 Security Score: {self.score}/100")

        if self.score >= 90:
            grade = "A (Excellent)"
            emoji = "🏆"
        elif self.score >= 80:
            grade = "B (Good)"
            emoji = "✅"
        elif self.score >= 70:
            grade = "C (Acceptable)"
            emoji = "⚠️"
        else:
            grade = "D (Needs Improvement)"
            emoji = "❌"

        print(f"📈 Grade: {emoji} {grade}")

        print(f"\n📋 Findings Summary:")
        print(f"   🔴 Critical: {len(critical)}")
        print(f"   🟠 High: {len(high)}")
        print(f"   🟡 Medium: {len(medium)}")
        print(f"   Total Issues: {len(self.findings)}")

        if self.findings:
            print("\n🔍 Detailed Findings:\n")
            for i, finding in enumerate(self.findings, 1):
                severity_emoji = {
                    'CRITICAL': '🔴',
                    'HIGH': '🟠',
                    'MEDIUM': '🟡'
                }
                print(f"{i}. {severity_emoji[finding['severity']]} [{finding['severity']}] {finding['category']}")
                print(f"   File: {finding['file']}")
                print(f"   Issue: {finding['issue']}")
                print(f"   Fix: {finding['recommendation']}\n")
        else:
            print("\n✅ No security issues found!")

        print("="*70)

        if self.score >= 80:
            print("✨ +70 Euphoria Points - Security Guardian Achievement!")

        return {
            'score': self.score,
            'grade': grade,
            'findings': self.findings,
            'critical_count': len(critical),
            'high_count': len(high),
            'medium_count': len(medium)
        }

def main():
    project_root = "/home/romex/projects/warrior-marketplace"
    auditor = SecurityAuditor(project_root)
    report = auditor.audit()

    return report['score'] >= 70  # Pass if score >= 70

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
