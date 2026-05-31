# Risk & Security Framework Implementation

## Overview

The Risk & Security Framework is a comprehensive system designed to protect investors and ensure project legitimacy through multiple layers of verification, guarantees, and documentation requirements.

## Components

### 1. Project Verification Module

**Verification Statuses:**
- **Under Review**: Project is being reviewed by the verification team
- **Missing Documents**: Project needs additional documentation
- **Rejected**: Project did not meet security standards
- **Verified/Approved**: Project passed all verification checks and is approved for investment

**Verification Process:**
1. Project owner submits required documents
2. Verification team performs initial review
3. If documents are complete, detailed verification begins
4. Final approval or rejection decision is made
5. Verified projects are listed on the platform

### 2. Guarantees System

The framework includes four types of guarantees:

#### Personal Guarantees
- **Legal Pledge**: A legal commitment from the project owner
- **Personal Guarantor**: A third party guaranteeing the project's success
- Example: "Legal pledge from project owner Ahmed Mohamed"

#### Financial Guarantees
- **Escrow Accounts**: Funds held in trust by a financial institution
- **Equipment Mortgage**: Physical assets used as collateral
- Example: "500,000 DZD in escrow account at National Bank"

#### Commercial Guarantees
- **Customer Contracts**: Signed contracts with existing customers
- **Purchase Orders**: Confirmed orders from buyers
- Example: "2,000,000 DZD in customer contracts from retail distributors"

#### Technical Guarantees
- **IP Ownership**: Patents, trademarks, or intellectual property rights
- **Source Code Rights**: Proprietary software or technology ownership
- Example: "Patent ownership for thermal sterilization process"

### 3. Document Requirements

#### Required Documents BEFORE Project Listing

These documents must be provided before a project can be listed:

1. **Personal IDs**
   - Valid identification of all project owners
   - Key: `personal_id`

2. **Legal Business Documents**
   - Commercial Register (السجل التجاري)
   - Tax Identification Number (NIF)
   - Business License
   - Key: `business_documents`

3. **Financial/Technical Studies**
   - Feasibility Study (دراسة الجدوى الاقتصادية الكاملة)
   - Financial Analysis
   - Technical Plans
   - Key: `financial_studies`

#### Auto-Generated Documents UPON INVESTMENT

These documents are automatically generated and delivered to investors:

1. **Partnership Contract** (عقد المشاركة)
   - Details investment terms and conditions
   - Key: `partnership_contract`

2. **Share Ownership Certificate** (شهادة ملكية الحصص)
   - Proves investor's ownership stake
   - Key: `share_ownership_certificate`

3. **Investor Registry** (سجل المستثمرين)
   - Official record of all investors
   - Key: `investor_registry`

## Data Structures

### ProjectVerification Interface

```typescript
interface ProjectVerification {
  status: VerificationStatus;
  verificationDate?: string;
  verifiedBy?: string;
  notes?: string;
  requiredDocuments: {
    personalIds: boolean;
    businessDocuments: boolean;
    financialStudies: boolean;
  };
}
```

### Guarantee Interface

```typescript
interface Guarantee {
  id: string;
  type: GuaranteeType; // Personal | Financial | Commercial | Technical
  details: PersonalGuarantee | FinancialGuarantee | CommercialGuarantee | TechnicalGuarantee;
  documentUrl?: string;
  verificationDate?: string;
}
```

## Components

### ProjectVerificationBadge
- Displays project verification status
- Shows verification progress
- Includes verification details and notes
- Location: `src/components/ProjectVerificationBadge.tsx`

### ProjectGuaranteesDisplay
- Shows all guarantees organized by type
- Displays summary statistics
- Renders detailed guarantee information
- Location: `src/components/ProjectGuaranteesDisplay.tsx`

### ProjectDocumentRequirements
- Lists required documents before listing
- Lists auto-generated documents after investment
- Distinguishes between mandatory and optional documents
- Location: `src/components/ProjectDocumentRequirements.tsx`

## Helper Functions

### Available Functions

**Status Functions:**
- `getVerificationStatusLabel(status)` - Get human-readable status label
- `getVerificationBadgeColor(status)` - Get CSS color classes for status
- `getGuaranteeTypeLabel(type)` - Get guarantee type label
- `isProjectFullyVerified(verification)` - Check if project is fully verified
- `getProjectVerificationProgress(verification)` - Calculate verification progress (0-100%)

**Guarantee Functions:**
- `getGuaranteesByType(guarantees, type)` - Filter guarantees by type
- `getTotalGuaranteeValue(guarantees)` - Calculate total financial guarantee value

**Factory Functions:**
- `createDefaultProjectVerification()` - Create default verification object

## Routes

### Security & Verification Page
- **Route**: `/security`
- **Path**: `src/routes/security.tsx`
- **Features**:
  - Overview of verification statuses
  - Explanation of guarantee types
  - Example verified project with guarantees
  - Document requirements overview
  - How the verification process works
  - Trust indicators

## Usage Examples

### Display Verification Badge

```tsx
import { ProjectVerificationBadge } from "@/components/ProjectVerificationBadge";
import { createDefaultProjectVerification } from "@/lib/projects";

const verification = createDefaultProjectVerification();
verification.status = "Verified/Approved";

<ProjectVerificationBadge 
  verification={verification} 
  showProgress={true}
  size="md"
/>
```

### Display Guarantees

```tsx
import { ProjectGuaranteesDisplay } from "@/components/ProjectGuaranteesDisplay";

<ProjectGuaranteesDisplay 
  guarantees={project.guarantees}
  title="نظام الضمانات"
  showSummary={true}
/>
```

### Display Document Requirements

```tsx
import { ProjectDocumentRequirements } from "@/components/ProjectDocumentRequirements";

<ProjectDocumentRequirements 
  showRequired={true}
  showAutoGenerated={true}
/>
```

## Integration with Projects

Projects now include optional verification and guarantees:

```typescript
interface Project {
  // ... existing fields
  verification?: ProjectVerification;
  guarantees?: Guarantee[];
}
```

Example projects with sample data have been created:
- **general-store**: Verified with Personal and Financial guarantees
- **honey-factory**: Verified with all four guarantee types

## Database Migrations (Future)

When integrating with Supabase, create the following tables:

```sql
-- Project Verification
CREATE TABLE project_verifications (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  status VARCHAR NOT NULL,
  verification_date TIMESTAMP,
  verified_by VARCHAR,
  notes TEXT,
  personal_ids_provided BOOLEAN DEFAULT FALSE,
  business_docs_provided BOOLEAN DEFAULT FALSE,
  financial_studies_provided BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Guarantees
CREATE TABLE project_guarantees (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  type VARCHAR NOT NULL, -- Personal, Financial, Commercial, Technical
  details JSONB NOT NULL,
  document_url VARCHAR,
  verification_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Required Documents (Pre-listing)
CREATE TABLE required_documents (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  document_type VARCHAR NOT NULL,
  file_url VARCHAR,
  upload_date TIMESTAMP,
  verified BOOLEAN DEFAULT FALSE
);

-- Generated Documents (Post-investment)
CREATE TABLE generated_documents (
  id UUID PRIMARY KEY,
  investment_id UUID NOT NULL REFERENCES investments(id),
  document_type VARCHAR NOT NULL, -- partnership_contract, share_certificate, investor_registry
  file_url VARCHAR,
  generated_date TIMESTAMP,
  delivered BOOLEAN DEFAULT FALSE
);
```

## Security Considerations

1. **Document Verification**: All documents are manually reviewed by the verification team
2. **Guarantee Validation**: Guarantees are verified through official channels
3. **Ongoing Monitoring**: Projects are subject to periodic re-verification
4. **Fraud Prevention**: Multiple layers of verification prevent fraudulent projects
5. **Investor Protection**: Comprehensive documentation protects investor rights

## Future Enhancements

1. **Automated Document Scanning**: Use AI/ML to pre-validate documents
2. **Blockchain Integration**: Store verification records on blockchain
3. **Real-time Monitoring**: Continuous project monitoring and alerts
4. **Insurance Integration**: Add project insurance as an additional guarantee
5. **Rating System**: Implement investor rating system based on guarantees
6. **Audit Trail**: Complete audit trail of all verification activities

## Translation Keys

Added security-related translations in three languages:
- **Arabic** (ar.json): Complete Arabic translations
- **English** (en.json): Complete English translations  
- **French** (fr.json): Complete French translations

Keys available under `security` namespace in all locale files.
