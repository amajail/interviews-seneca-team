# Excel File Analysis

## Source File
`sample/IC-Simple-Job-Applicant-Tracking-Spreadsheet-Template_Google-Sheet.xlsx`

## Purpose
This Excel file is currently used to manually track IT project interview candidates. The application will replace this manual tracking system with a modern web-based solution.

## Typical Applicant Tracking Spreadsheet Structure

Based on industry-standard job applicant tracking templates, the Excel file likely contains the following data fields:

### Candidate Information
- **Candidate Name**: Full name of the applicant
- **Email**: Contact email address
- **Phone**: Contact phone number
- **Position Applied For**: Job title/role
- **Application Date**: Date when candidate applied
- **Resume/CV Link**: Link to resume or notes about resume

### Interview Process Tracking
- **Interview Stage**: Current stage in the interview process (e.g., Phone Screen, Technical Interview, Final Interview)
- **Interview Date**: Date of interview(s)
- **Interviewer**: Person(s) who conducted the interview
- **Interview Notes**: Observations and feedback
- **Technical Assessment**: Results of technical evaluation
- **Skills Rating**: Assessment of technical skills

### Status & Decision
- **Current Status**: Application status (e.g., New, In Progress, Interviewed, Offered, Rejected, Hired)
- **Decision**: Final hiring decision
- **Rejection Reason**: If rejected, reason for rejection
- **Offer Details**: Salary, start date, etc.

### Additional Metadata
- **Source**: How candidate was found (LinkedIn, Referral, Job Board, etc.)
- **Priority**: Urgency/priority level
- **Next Steps**: Planned next actions
- **Follow-up Date**: When to follow up next
- **Notes**: General notes and comments

## Key Requirements Identified

1. **Data Migration**: Need to import existing Excel data into Azure Table Storage
2. **CRUD Operations**: Full create, read, update, delete functionality for candidates
3. **Search & Filter**: Ability to search and filter candidates by various criteria
4. **Status Tracking**: Track candidates through different interview stages
5. **Multi-user Access**: Unlike Excel, multiple users should be able to access simultaneously
6. **Audit Trail**: Track who made changes and when
7. **Data Validation**: Ensure data integrity (email format, phone format, required fields)
8. **Export Functionality**: Ability to export data back to Excel if needed

## Data Model Considerations

### Azure Table Storage Schema
- **PartitionKey**: Could be position or year-month for performance
- **RowKey**: Unique candidate ID (GUID)
- **Timestamp**: Automatic Azure timestamp
- All other fields as entity properties

### Entities to Consider
1. **Candidate**: Core candidate information
2. **Interview**: Separate entity for interview events
3. **Position**: Job positions being filled
4. **Interviewer**: People conducting interviews
5. **Note**: Interview notes and feedback

## Technical Constraints

1. Azure Table Storage is NoSQL - no joins, denormalization may be needed
2. Limited query capabilities - may need to index commonly searched fields
3. Maximum entity size: 1MB
4. Property name length: 255 characters max
5. String property max size: 64KB

## Next Steps

1. Confirm actual Excel structure with stakeholders
2. Design normalized vs denormalized data model
3. Plan data migration strategy
4. Define API contracts for backend
5. Design UI wireframes for frontend
