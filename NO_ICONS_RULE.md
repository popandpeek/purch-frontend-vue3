# NO ICONS RULE

## 🚫 **ABSOLUTE RULE: NO ICONS ANYWHERE IN THE PROJECT**

This project **NEVER** uses icons of any kind. All visual elements must use text labels instead.

### ❌ **FORBIDDEN:**
- Emoji icons (👁️, ✏️, 📤, 🗑️, ×, etc.)
- Font icons (FontAwesome, Material Icons, etc.)
- SVG icons
- Image icons
- Quasar icons (`q-icon`)
- Any visual symbols that aren't text

### ✅ **REQUIRED:**
- Use descriptive text labels for all buttons
- Use text for all visual indicators
- Use words like "View", "Edit", "Delete", "Add", "Remove", etc.
- Use clear, descriptive button text

### 📝 **EXAMPLES:**

**❌ WRONG:**
```vue
<button @click="handleView">
  <span class="btn-icon">👁️</span>
</button>

<button @click="handleEdit">
  <span class="btn-icon">✏️</span>
</button>

<q-icon name="delete" />
```

**✅ CORRECT:**
```vue
<button @click="handleView">
  View
</button>

<button @click="handleEdit">
  Edit
</button>

<button @click="handleDelete">
  Delete
</button>
```

### 🔍 **AUDIT CHECKLIST:**
- [ ] No emoji characters in buttons or UI elements
- [ ] No `q-icon` components
- [ ] No `icon=` attributes
- [ ] No FontAwesome classes (`fa-`, `fas`, `far`, `fab`)
- [ ] No Material Icons
- [ ] All buttons have descriptive text labels
- [ ] All visual indicators use text

### 🎯 **GOAL:**
Every user interface element should be self-explanatory through text labels, making the application accessible and clear without relying on visual symbols that might be ambiguous or culturally specific.
