## Tawk.to Setup

Use this guide to enable the embedded live-chat widget in Asafo Tech.

Official references:
- https://help.tawk.to/article/how-to-maximize-the-widget-when-a-website-loads
- https://help.tawk.to/article/how-to-maximize-the-widget-after-a-trigger
- https://help.tawk.to/article/how-to-use-setattributes-with-a-hash-in-javascript

### 1. Create a Tawk.to account

1. Go to `https://www.tawk.to/`
2. Create or log in to your account
3. Add your website/property

### 2. Find your widget details

In Tawk.to, open your widget embed code. From the script URL:

```html
https://embed.tawk.to/PROPERTY_ID/WIDGET_ID
```

You need:
- `PROPERTY_ID`
- `WIDGET_ID`

### 3. Fill your env files

Add the values to:
- [`.env`](C:\xampp\htdocs\e-commerce\.env)
- [`.env.production`](C:\xampp\htdocs\e-commerce\.env.production)

```env
VITE_TAWK_PROPERTY_ID=your_property_id
VITE_TAWK_WIDGET_ID=your_widget_id
```

Current Asafo Tech values already added:

```env
VITE_TAWK_PROPERTY_ID=69b4ac06ffafbe1c36c96bcb
VITE_TAWK_WIDGET_ID=1jjkrvv23
```

### 4. Rebuild the app

For local dev:

```sh
npm run dev
```

For the Apache/XAMPP version:

```sh
npm run build
```

### 5. Test the widget

1. Open the customer dashboard
2. Go to the `Account` tab
3. Click `Live Chat`
4. The Tawk widget should open

### Notes

- The app already passes signed-in customer name and email to Tawk when available.
- If the `Live Chat` button looks disabled, your Tawk env values are still empty.
- WhatsApp support remains separate from Tawk and uses the WhatsApp link button.
