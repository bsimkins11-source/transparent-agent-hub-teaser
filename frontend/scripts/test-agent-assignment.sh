#!/bin/bash

# Agent Assignment Functionality Test Runner
# This script runs comprehensive tests for the agent assignment system

echo "🚀 Starting Agent Assignment Functionality QA Testing"
echo "=================================================="

# Set environment variables for testing
export NODE_ENV=test
export CI=true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run tests with coverage
echo "🧪 Running Agent Assignment Tests..."
echo ""

# Test 1: Hierarchical Permission Service
echo "1️⃣ Testing Hierarchical Permission Service..."
npm test -- --testPathPattern="hierarchicalPermissionService.test.ts" --verbose
PERMISSION_TEST_EXIT_CODE=$?

echo ""

# Test 2: User Library Service
echo "2️⃣ Testing User Library Service..."
npm test -- --testPathPattern="userLibraryService.test.ts" --verbose
LIBRARY_TEST_EXIT_CODE=$?

echo ""

# Test 3: Agent Assignment Manager Component
echo "3️⃣ Testing Agent Assignment Manager Component..."
npm test -- --testPathPattern="AgentAssignmentManager.test.tsx" --verbose
MANAGER_TEST_EXIT_CODE=$?

echo ""

# Test 4: User Agent Assignment Component
echo "4️⃣ Testing User Agent Assignment Component..."
npm test -- --testPathPattern="UserAgentAssignment.test.tsx" --verbose
USER_ASSIGNMENT_TEST_EXIT_CODE=$?

echo ""

# Test 5: Company Admin Dashboard Integration
echo "5️⃣ Testing Company Admin Dashboard Integration..."
npm test -- --testPathPattern="CompanyAdminDashboard.test.tsx" --verbose
DASHBOARD_TEST_EXIT_CODE=$?

echo ""

# Test 6: Run all tests together for integration
echo "6️⃣ Running Integration Tests..."
npm test -- --testPathPattern="agent.*assignment|AgentAssignment|UserAgentAssignment|CompanyAdminDashboard" --verbose
INTEGRATION_TEST_EXIT_CODE=$?

echo ""
echo "=================================================="
echo "📊 Test Results Summary"
echo "=================================================="

# Check individual test results
if [ $PERMISSION_TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ Hierarchical Permission Service: PASSED"
else
    echo "❌ Hierarchical Permission Service: FAILED"
fi

if [ $LIBRARY_TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ User Library Service: PASSED"
else
    echo "❌ User Library Service: FAILED"
fi

if [ $MANAGER_TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ Agent Assignment Manager: PASSED"
else
    echo "❌ Agent Assignment Manager: FAILED"
fi

if [ $USER_ASSIGNMENT_TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ User Agent Assignment: PASSED"
else
    echo "❌ User Agent Assignment: FAILED"
fi

if [ $DASHBOARD_TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ Company Admin Dashboard: PASSED"
else
    echo "❌ Company Admin Dashboard: FAILED"
fi

if [ $INTEGRATION_TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ Integration Tests: PASSED"
else
    echo "❌ Integration Tests: FAILED"
fi

echo ""

# Generate coverage report
echo "📈 Generating Coverage Report..."
npm test -- --coverage --testPathPattern="agent.*assignment|AgentAssignment|UserAgentAssignment|CompanyAdminDashboard" --watchAll=false

echo ""
echo "=================================================="

# Determine overall success
if [ $PERMISSION_TEST_EXIT_CODE -eq 0 ] && [ $LIBRARY_TEST_EXIT_CODE -eq 0 ] && [ $MANAGER_TEST_EXIT_CODE -eq 0 ] && [ $USER_ASSIGNMENT_TEST_EXIT_CODE -eq 0 ] && [ $DASHBOARD_TEST_EXIT_CODE -eq 0 ] && [ $INTEGRATION_TEST_EXIT_CODE -eq 0 ]; then
    echo "🎉 All Agent Assignment Tests PASSED!"
    echo "✅ The agent assignment functionality is working correctly."
    exit 0
else
    echo "💥 Some Agent Assignment Tests FAILED!"
    echo "❌ Please review the failed tests above and fix the issues."
    exit 1
fi
