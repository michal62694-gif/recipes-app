# 🍳 Recipe Manager - מנהל מתכונים

A modern, Hebrew-language recipe management application with voice reading capabilities.

## ✨ Features

- 📖 **Recipe Management**: Add, view, and search recipes
- 🎤 **Voice Reader**: Text-to-speech for step-by-step cooking instructions
- 🌓 **Dark/Light Theme**: Toggle between themes
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 💾 **Local Storage**: All data stored in browser (no server required)
- 🇮🇱 **Hebrew RTL Support**: Full right-to-left layout

## 🚀 Quick Start

### Option 1: Open Locally
1. Download or clone this repository
2. Open `login.html` in your web browser
3. Login with default credentials:
   - Username: `admin` / Password: `1234`
   - Username: `user` / Password: `1111`

### Option 2: Deploy to GitHub Pages
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📁 Project Structure

```
recipes-app/
├── index.html          # Landing page
├── login.html          # Login page
├── recipes.html        # Recipe list page
├── recipe.html         # Single recipe view with voice reader
├── settings.html       # User settings
├── css/
│   └── style.css       # All styles with theme support
├── js/
│   ├── storage.js      # LocalStorage initialization
│   ├── auth.js         # Authentication logic
│   ├── recipes.js      # Recipe list management
│   ├── reader.js       # Voice reading functionality
│   └── settings.js     # Settings management
├── DEPLOYMENT.md       # Deployment guide
└── README.md          # This file
```

## 🎨 Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables, flexbox, grid
- **JavaScript (ES6+)**: Vanilla JS, no frameworks
- **Web Speech API**: Text-to-speech functionality
- **LocalStorage API**: Client-side data persistence

## 🔧 Settings

Configure your experience:
- **Step Delay**: Time between voice-read steps (1-30 seconds)
- **Theme**: Light or dark mode

## 📱 Browser Compatibility

- ✅ Chrome/Edge (recommended for voice features)
- ✅ Firefox
- ✅ Safari
- ⚠️ Voice reading requires browser support for Web Speech API

## 🔒 Security Notes

- Passwords are stored in plain text in localStorage (demo purposes only)
- For production use, implement proper authentication
- Data is stored locally per device/browser

## 🌟 Default Recipes

The app comes with 12 pre-loaded Hebrew recipes:
- חומוס ביתי (Homemade Hummus)
- סלט ירקות (Vegetable Salad)
- שקשוקה (Shakshuka)
- פסטה ברוטב עגבניות (Pasta with Tomato Sauce)
- מרק עוף (Chicken Soup)
- And more...

## 🛠️ Development

### Making Changes
1. Edit files in your preferred code editor
2. Test locally by opening HTML files in browser
3. Commit and push changes to deploy (if using GitHub Pages)

### Adding New Features
- All JavaScript is modular and well-commented
- CSS uses variables for easy theming
- Follow existing patterns for consistency

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and use this project for your own purposes!

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for home cooks**
