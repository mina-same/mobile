# Database Seed Script

## Overview

The seed script populates the database with sample data for testing and development.

## Usage

```bash
cd server
npm run seed
```

Or directly:
```bash
node scripts/seedData.js
```

## What It Seeds

### Feedback (10 records)
- Various employees (Alice Johnson, Bob Smith, Carol Williams, David Brown, Emma Davis)
- Different scores (1-5)
- Realistic notes and dates

### Conversations (5 conversations)
- One conversation per employee
- Properly formatted employee IDs

### Messages (16 messages)
- Sample messages for each conversation
- Messages from both HR and employees
- Realistic timestamps

## Data Structure

### Employees
- Alice Johnson
- Bob Smith
- Carol Williams
- David Brown
- Emma Davis

### Feedback Scores Distribution
- 5 stars: 4 records
- 4 stars: 4 records
- 3 stars: 2 records

### Conversations
- Each employee has one conversation
- With HR user "Sarah Connor (HR)"

## Notes

- The script will **clear existing data** before seeding
- Safe to run multiple times
- Uses the MongoDB connection from `.env` file

## Output

When successful, you'll see:
```
🎉 Database seed completed successfully!

📊 Summary:
   - 10 feedback records
   - 5 conversations
   - 16 messages
```

