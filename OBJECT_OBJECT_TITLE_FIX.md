# [object Object] Chat Title Fix

## Problem
When clicking the "New Chat" button, the chat title displayed as `[object Object]` instead of "New Chat".

## Root Cause
The issue was caused by React's event handling. When a button's `onClick` handler is set to a function like this:

```jsx
<button onClick={createNewChat}>
```

React automatically passes the **click event object** as the first parameter to the function. 

In our case:
```javascript
const createNewChat = async (initialMessage = null) => {
  // initialMessage was receiving the event object, not null!
  title: initialMessage ? String(initialMessage) : 'New Chat'
}
```

When the button was clicked:
1. React called `createNewChat(event)` (where `event` is the click event object)
2. `initialMessage` received the event object instead of `null`
3. `String(event)` converted the event object to the string `"[object Object]"`
4. This became the chat title

## Solution
Added a type check at the beginning of `createNewChat` to filter out non-string values:

```javascript
const createNewChat = async (initialMessage = null) => {
  // Handle case where event object is passed (from onClick)
  if (initialMessage && typeof initialMessage !== 'string') {
    initialMessage = null;
  }
  
  // Rest of the function...
}
```

Now the function properly handles both scenarios:
- ✅ When called from button click: `createNewChat(event)` → filters out event → uses "New Chat"
- ✅ When called with string: `createNewChat("What is SQL injection?")` → uses the string as title

## Testing
1. Click "New Chat" button → Title shows "New Chat" ✅
2. Click example question → Title shows the question (truncated if > 30 chars) ✅
3. Send a message in new chat → Title updates to first message ✅

## Files Modified
- `frontend/src/App.jsx` - Added type check in `createNewChat` function

## Impact
- ✅ Chat titles display correctly
- ✅ No more `[object Object]` titles
- ✅ Proper handling of both button clicks and programmatic calls with initial messages
