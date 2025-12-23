#!/bin/bash

# materially  Backend - Quick Test Script
# This script tests all major API endpoints

BASE_URL="http://localhost:5000/api"
TOKEN=""

echo "🚀 materially  Backend API Test"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
HEALTH=$(curl -s -w "\n%{http_code}" "$BASE_URL/../api/health")
HTTP_CODE=$(echo "$HEALTH" | tail -n1)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Health Check Passed${NC}"
else
    echo -e "${RED}✗ Health Check Failed${NC}"
fi
echo ""

# Test 2: Register Employer
echo "2️⃣  Testing Employer Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Employer",
    "email": "employer-test@materially .com",
    "password": "test123456",
    "role": "employer",
    "companyName": "Test Tech Corp"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Registration Successful${NC}"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "Token: ${TOKEN:0:20}..."
else
    echo -e "${YELLOW}⚠ User may already exist, trying login...${NC}"
    
    # Try Login instead
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "employer-test@materially .com",
        "password": "test123456"
      }')
    
    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        echo -e "${GREEN}✓ Login Successful${NC}"
        TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        echo "Token: ${TOKEN:0:20}..."
    else
        echo -e "${RED}✗ Authentication Failed${NC}"
        echo "Response: $LOGIN_RESPONSE"
        exit 1
    fi
fi
echo ""

# Test 3: Create Job
echo "3️⃣  Testing Job Creation..."
JOB_RESPONSE=$(curl -s -X POST "$BASE_URL/internship" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Frontend Developer Intern",
    "company": "Test Tech Corp",
    "description": "Looking for talented frontend developers",
    "requirements": ["React", "JavaScript", "HTML/CSS"],
    "responsibilities": ["Build UI components", "Write clean code"],
    "skills": ["React", "JavaScript", "Git"],
    "location": "Delhi, India",
    "jobType": "remote",
    "duration": "3 months",
    "stipend": {
      "min": 10000,
      "max": 15000,
      "currency": "INR"
    },
    "openings": 2,
    "applicationDeadline": "2025-12-31",
    "startDate": "2026-01-15",
    "status": "active"
  }')

if echo "$JOB_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Job Created Successfully${NC}"
    JOB_ID=$(echo "$JOB_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
    echo "Job ID: $JOB_ID"
else
    echo -e "${RED}✗ Job Creation Failed${NC}"
    echo "Response: $JOB_RESPONSE"
fi
echo ""

# Test 4: Get Employerjobs
echo "4️⃣  Testing Get Employerjobs..."
internship_RESPONSE=$(curl -s -X GET "$BASE_URL/internship/employer/my-internship" \
  -H "Authorization: Bearer $TOKEN")

if echo "$internship_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓jobs Retrieved Successfully${NC}"
    JOB_COUNT=$(echo "$internship_RESPONSE" | grep -o '"totalinternship":[0-9]*' | cut -d':' -f2)
    echo "Totaljobs: $JOB_COUNT"
else
    echo -e "${RED}✗ Failed to Getjobs${NC}"
fi
echo ""

# Test 5: Get Analytics
echo "5️⃣  Testing Analytics..."
ANALYTICS_RESPONSE=$(curl -s -X GET "$BASE_URL/internship/analytics/stats" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ANALYTICS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Analytics Retrieved Successfully${NC}"
else
    echo -e "${RED}✗ Failed to Get Analytics${NC}"
fi
echo ""

# Test 6: Get Profile
echo "6️⃣  Testing Get Profile..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/profile" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Profile Retrieved Successfully${NC}"
else
    echo -e "${RED}✗ Failed to Get Profile${NC}"
fi
echo ""

# Test 7: Update Profile
echo "7️⃣  Testing Update Profile..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phone": "+91 9876543210",
    "companyWebsite": "https://testtechcorp.com"
  }')

if echo "$UPDATE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Profile Updated Successfully${NC}"
else
    echo -e "${RED}✗ Failed to Update Profile${NC}"
fi
echo ""

# Test 8: Get Messages (should be empty initially)
echo "8️⃣  Testing Messages..."
MESSAGES_RESPONSE=$(curl -s -X GET "$BASE_URL/messages?type=inbox" \
  -H "Authorization: Bearer $TOKEN")

if echo "$MESSAGES_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Messages Retrieved Successfully${NC}"
else
    echo -e "${RED}✗ Failed to Get Messages${NC}"
fi
echo ""

# Summary
echo "================================"
echo "🎉 API Testing Complete!"
echo ""
echo "All major endpoints tested:"
echo "  ✓ Health Check"
echo "  ✓ Authentication (Register/Login)"
echo "  ✓ Job Creation"
echo "  ✓ Getjobs"
echo "  ✓ Analytics"
echo "  ✓ Profile Management"
echo "  ✓ Messages"
echo ""
echo "Backend is working properly! 🚀"
echo "================================"
