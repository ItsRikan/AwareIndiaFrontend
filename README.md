# Aware India - Food & Product Scanner

A full-featured React frontend for scanning food and cosmetic products to analyze ingredients, detect allergens, and get personalized health advice.

![Aware India](https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=1200&q=80)

## Features

- 🔍 **Instant Scanning** - Upload product images for instant ingredient analysis
- 🛡️ **Allergen Detection** - Identify potentially harmful additives personalized to your health profile
- ❤️ **Health Scores** - Get easy-to-understand health scores (0-10) for every ingredient
- 📊 **Nutrition Estimates** - View calorie, protein, sugar, and other nutritional information
- 🎨 **Beautiful Dark Theme** - Eye-friendly dark UI with glow effects for safety status
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔐 **Authentication** - Supabase auth or local mock auth fallback

## Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Supabase** for authentication (optional)
- **Vite** for fast development and building

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ItsRikan/AwareIndiaFrontend.git
cd AwareIndiaFrontend
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Create a `.env` file (optional):
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
# or
bun run dev
```

5. Open [http://localhost:8080](http://localhost:8080) in your browser.

## Environment Variables

Create a `.env` file with the following variables:

```env
# API Configuration
VITE_API_BASE=<backend url of the aware india backend>

# Supabase (optional - for cloud authentication)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Variable Details

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE` | No | `<backend url of the aware india backend>` | Backend API base URL |
| `VITE_SUPABASE_URL` | No | - | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No | - | Supabase anonymous key |

## Authentication Modes

### Supabase Mode (Recommended for Production)

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set:
- Uses Supabase Auth for user management
- Email/password authentication
- User metadata stored in Supabase
- Session persistence across browser tabs

### Mock Mode (Default for Development)

When Supabase env vars are not set:
- Uses localStorage for user data
- No external dependencies
- Great for local development
- Data persists in browser only

## API Endpoints

The app communicates with these backend endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Home/Hero page data |
| `/imagekit/auth` | GET | Get ImageKit upload credentials |
| `/mock-upload` | POST | Mock image upload (when mock_mode is true) |
| `/scan` | POST | Analyze product image |

### Scan Request

```json
POST /scan
{
  "image_url": "https://...",
  "category": "Food",
  "allergy_text": "lactose intolerant"
}
```

### Scan Response

```json
{
  "is_safe": false,
  "product_name": "Product Name",
  "url": "https://...",
  "description": "Contains harmful additives...",
  "ingredients": [
    {
      "name": "Ingredient Name",
      "Itype": "preservative",
      "description": "Description of the ingredient",
      "health_score": 3
    }
  ],
  "nutrition_estimate": {
    "calory": 210,
    "energy": 880,
    "protein": 5
  },
  "health_score": 4
}
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── FileUpload.tsx  # Image upload component
│   ├── Footer.tsx      # Page footer
│   ├── HealthScoreBadge.tsx  # Score display
│   ├── IngredientCard.tsx    # Ingredient details
│   ├── NavBar.tsx      # Navigation bar
│   ├── NutritionChips.tsx    # Nutrition display
│   ├── ResultCard.tsx  # Scan result display
│   └── Spinner.tsx     # Loading indicators
├── contexts/
│   └── AuthContext.tsx # Authentication provider
├── lib/
│   ├── api.ts          # API client
│   ├── image.ts        # Image utilities
│   └── utils.ts        # General utilities
├── pages/
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Auth page
│   ├── Profile.tsx     # User profile
│   ├── Scan.tsx        # Main scanning page
│   └── NotFound.tsx    # 404 page
├── types/
│   └── index.ts        # TypeScript definitions
├── App.tsx             # Main app component
├── index.css           # Global styles & design system
└── main.tsx            # App entry point
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Manual Build

```bash
npm run build
# Output in dist/ folder
```

## Usage Flow

1. **Home Page**: View features and click "Get Started"
2. **Login/Signup**: Create account or login (mock auth if no Supabase)
3. **Scan Page**: 
   - Upload product image
   - Select category (Food, Cosmetics, etc.)
   - Optionally enter allergies/conditions
   - Click "Scan Product"
4. **Results**: View health score, ingredients analysis, and recommendations
5. **Profile**: View account info and scan history

## Features in Detail

### Image Compression
- Automatic client-side compression before upload
- Reduces upload time and bandwidth
- Uses `browser-image-compression` library

### Health Score Display
- **0-3**: Poor (red) - Contains harmful ingredients
- **4-6**: Fair (yellow) - Some concerns
- **7-10**: Good (green) - Safe to consume

### Glow Effects
- Green glow for safe products
- Red glow for unsafe products
- Animated pulse effect for attention

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ for healthier choices
