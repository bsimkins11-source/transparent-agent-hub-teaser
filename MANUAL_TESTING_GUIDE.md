# Manual Testing Guide for Add/Remove Agent Functionality

## 🎯 Overview
This guide provides step-by-step instructions for manually testing the add/remove agent functionality from user libraries in the Transparent AI Agent Hub.

## 🚀 Prerequisites
- Backend server running on port 8080
- Frontend server running on port 3000
- Test user account created
- Browser with developer tools open

## 📋 Test Scenarios

### 1. Basic Add/Remove Flow

#### Test Case: Add Free Agent to Library
**Objective**: Verify that users can add free agents to their personal library

**Steps**:
1. Open http://localhost:3000 in your browser
2. Sign in with a test user account
3. Navigate to the Global Library tab
4. Find the "Gemini Chat Agent" (should be marked as free tier)
5. Click the "Add to Library" button
6. Verify success toast message appears
7. Navigate to Personal Library tab
8. Verify the agent appears in the personal library
9. Verify the agent shows "In My Library" status in Global Library

**Expected Results**:
- ✅ Add button changes to "In My Library" status
- ✅ Success toast appears
- ✅ Agent appears in Personal Library
- ✅ UI updates immediately without page refresh

#### Test Case: Remove Agent from Library
**Objective**: Verify that users can remove agents from their personal library

**Steps**:
1. In Personal Library tab, find the agent you just added
2. Click the "Remove" button
3. Verify confirmation dialog appears (if implemented)
4. Confirm removal
5. Verify success toast message appears
6. Verify agent disappears from Personal Library
7. Navigate back to Global Library
8. Verify "Add to Library" button reappears

**Expected Results**:
- ✅ Remove button works correctly
- ✅ Success toast appears
- ✅ Agent disappears from Personal Library
- ✅ Add button reappears in Global Library

### 2. Premium Agent Handling

#### Test Case: Premium Agent Access Control
**Objective**: Verify that premium agents require approval and cannot be added directly

**Steps**:
1. In Global Library, find a premium agent (e.g., "Google Imagen Agent")
2. Verify the button shows "Request Access" instead of "Add to Library"
3. Click "Request Access" button
4. Verify appropriate message about premium access requirements
5. Verify agent is not added to personal library

**Expected Results**:
- ✅ Premium agents show "Request Access" button
- ✅ Cannot add premium agents directly
- ✅ Appropriate messaging about approval requirements

### 3. Library State Management

#### Test Case: Library State Persistence
**Objective**: Verify that library state persists across page refreshes and navigation

**Steps**:
1. Add an agent to your library
2. Refresh the page
3. Verify the agent still shows as "In My Library"
4. Navigate between different library tabs
5. Verify state consistency across all tabs
6. Sign out and sign back in
7. Verify library state is maintained

**Expected Results**:
- ✅ Library state persists across page refreshes
- ✅ State is consistent across all library tabs
- ✅ State persists across authentication sessions

### 4. Error Handling

#### Test Case: Network Error Handling
**Objective**: Verify graceful handling of network errors during add/remove operations

**Steps**:
1. Open browser developer tools
2. Go to Network tab
3. Set network to "Offline" or block API calls
4. Try to add an agent to library
5. Verify appropriate error message appears
6. Try to remove an agent from library
7. Verify appropriate error message appears

**Expected Results**:
- ✅ Graceful error handling for network issues
- ✅ User-friendly error messages
- ✅ UI remains in consistent state

#### Test Case: Authentication Error Handling
**Objective**: Verify proper handling of authentication errors

**Steps**:
1. Clear authentication tokens from browser storage
2. Try to add an agent to library
3. Verify authentication error message appears
4. Verify user is redirected to login if needed

**Expected Results**:
- ✅ Authentication errors are handled gracefully
- ✅ Users are prompted to sign in when needed
- ✅ Clear error messaging about authentication requirements

### 5. UI/UX Validation

#### Test Case: Button State Management
**Objective**: Verify that buttons show correct states during operations

**Steps**:
1. Click "Add to Library" button
2. Verify button shows loading state
3. Verify button is disabled during operation
4. Wait for operation to complete
5. Verify button changes to "In My Library" status
6. Repeat for remove operation

**Expected Results**:
- ✅ Loading states are displayed correctly
- ✅ Buttons are disabled during operations
- ✅ State transitions are smooth and clear

#### Test Case: Toast Notifications
**Objective**: Verify that appropriate feedback is provided to users

**Steps**:
1. Add an agent to library
2. Verify success toast appears
3. Remove an agent from library
4. Verify success toast appears
5. Try to add an already-added agent
6. Verify appropriate error toast appears

**Expected Results**:
- ✅ Success toasts appear for successful operations
- ✅ Error toasts appear for failed operations
- ✅ Toast messages are clear and informative

### 6. Edge Cases

#### Test Case: Concurrent Operations
**Objective**: Verify handling of rapid successive add/remove operations

**Steps**:
1. Rapidly click "Add to Library" multiple times
2. Verify only one operation is processed
3. Rapidly click "Remove" multiple times
4. Verify only one operation is processed

**Expected Results**:
- ✅ Duplicate operations are prevented
- ✅ UI remains responsive
- ✅ No duplicate entries or errors

#### Test Case: Large Library Performance
**Objective**: Verify performance with many agents in library

**Steps**:
1. Add multiple agents to library (if test data available)
2. Navigate between library tabs
3. Verify smooth performance
4. Check for any memory leaks or performance issues

**Expected Results**:
- ✅ Smooth performance with multiple agents
- ✅ No memory leaks or performance degradation
- ✅ Responsive UI regardless of library size

## 🔍 Testing Tools

### Browser Developer Tools
- **Console**: Check for JavaScript errors
- **Network**: Monitor API calls and responses
- **Application**: Check localStorage and sessionStorage
- **Performance**: Monitor for performance issues

### API Testing
- **Postman/Insomnia**: Test API endpoints directly
- **cURL**: Command-line API testing
- **Browser Network Tab**: Monitor real-time API calls

## 📊 Test Results Template

```
Test Session: [Date] [Time]
Tester: [Name]
Environment: [Local/Staging/Production]

✅ PASSED TESTS:
- [List all passed tests]

❌ FAILED TESTS:
- [List all failed tests with details]

⚠️  ISSUES FOUND:
- [List any issues or bugs discovered]

💡 IMPROVEMENTS SUGGESTED:
- [List any UX/UI improvements]

📝 NOTES:
- [Additional observations or comments]
```

## 🚨 Common Issues to Watch For

1. **State Synchronization**: Library state not updating across tabs
2. **Loading States**: Buttons not showing loading states during operations
3. **Error Handling**: Generic error messages instead of specific ones
4. **Performance**: Slow response times with large libraries
5. **Mobile Responsiveness**: UI issues on mobile devices
6. **Accessibility**: Keyboard navigation and screen reader support

## 🎯 Success Criteria

A successful test session should demonstrate:
- ✅ All basic add/remove operations work correctly
- ✅ UI updates immediately and consistently
- ✅ Error handling is graceful and informative
- ✅ Performance is acceptable across all scenarios
- ✅ User experience is smooth and intuitive

## 🔄 Regression Testing

After any changes to the add/remove functionality, re-run these tests to ensure:
- Existing functionality still works
- No new bugs were introduced
- Performance hasn't degraded
- UI remains consistent

---

**Remember**: Manual testing complements automated tests and helps catch edge cases and UX issues that automated tests might miss. Document any issues found and provide detailed steps to reproduce them.
