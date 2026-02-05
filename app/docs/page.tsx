"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Book, Code, Terminal, Copy, Check, ChevronRight, 
  Download, Play, Settings, Layers, Map, Navigation,
  Zap, Package, FileCode, Database, Globe, Cloud,
  Monitor, Command, CheckCircle, AlertCircle,
  BookOpen
} from "lucide-react";

export default function DocumentationPage() {
  const [os, setOs] = useState<"windows" | "ubuntu">("ubuntu");
  const [activeSection, setActiveSection] = useState("getting-started");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen dark:bg-black bg-white text-white">
      
      {/* Hero */}
      <section className="relative pt-16 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-400/30 mb-8">
              <BookOpen className="text-purple-800" size={20} />
              <span className="font-bold text-purple-800">Documentation Complète</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-6 bg-purple-800 dark:bg-gradient-to-r dark:from-white dark:via-blue-200 dark:to-purple-300 bg-clip-text text-transparent">
              Guide du Développeur<br />PoI - Navigoo
            </h1>

            <p className="text-xl text-gray-800 dark:text-slate-300 max-w-3xl mx-auto mb-12">
              API REST & Bibliothèque React Native pour intégrer la cartographie 
              du Cameroun dans vos applications
            </p>

            {/* OS Selector */}
            <div className="inline-flex bg-gray-50 dark:bg-slate-800/50 backdrop-blur-md p-2 rounded-2xl border dark:border-slate-700/50 shadow-xl">
              <button
                onClick={() => setOs("ubuntu")}
                className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 ${
                  os === "ubuntu"
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                    : "dark:text-slate-400 text-slate-800 hover:text-white"
                }`}
              >
                <Terminal size={20} />
                Ubuntu / Linux
              </button>
              <button
                onClick={() => setOs("windows")}
                className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 ${
                  os === "windows"
                    ? "bg-gradient-to-r from-purple-600 to-purple-900 text-white shadow-lg"
                    : "dark:text-slate-400 text-slate-800 hover:text-white"
                }`}
              >
                <Monitor size={20} />
                Windows
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 dark:bg-slate-800/30 bg-slate-50 backdrop-blur-xl rounded-2xl border dark:border-slate-700/50 border-slate-200 p-6">
                <h3 className="text-sm font-bold dark:text-slate-400 text-slate-800 mb-4 uppercase tracking-wider">
                  Sommaire
                </h3>
                <nav className="space-y-2">
                  <NavItem 
                    id="getting-started" 
                    label="Démarrage Rapide" 
                    icon={<Zap size={18} />}
                    active={activeSection === "getting-started"}
                    onClick={() => setActiveSection("getting-started")}
                  />
                  <NavItem 
                    id="api-reference" 
                    label="Référence API" 
                    icon={<Database size={18} />}
                    active={activeSection === "api-reference"}
                    onClick={() => setActiveSection("api-reference")}
                  />
                  <NavItem 
                    id="library" 
                    label="Bibliothèque Native" 
                    icon={<Package size={18} />}
                    active={activeSection === "library"}
                    onClick={() => setActiveSection("library")}
                  />
                  <NavItem 
                    id="examples" 
                    label="Exemples Complets" 
                    icon={<FileCode size={18} />}
                    active={activeSection === "examples"}
                    onClick={() => setActiveSection("examples")}
                  />
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {activeSection === "getting-started" && (
                  <GettingStarted os={os} copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
                )}
                {activeSection === "api-reference" && (
                  <ApiReference copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
                )}
                {activeSection === "library" && (
                  <LibraryDocs os={os} copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
                )}
                {activeSection === "examples" && (
                  <CompleteExamples copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================
// SECTIONS
// ============================================

const GettingStarted = ({ os, copyToClipboard, copiedCode }: any) => {
  const installCommand = os === "windows" 
    ? "npm install navigoo-sdk" 
    : "sudo npm install -g navigoo-sdk";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="dark:bg-slate-800/50 bg-transparent backdrop-blur-xl rounded-3xl border dark:border-slate-700/50 bg-slate-200 p-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-600 to-purple-900 p-4 rounded-2xl">
            <Zap className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-black dark:text-white">Démarrage Rapide</h2>
            <p className="dark:text-slate-400 text-slate-700">Intégrez Navigoo en 5 minutes</p>
          </div>
        </div>

        <div className="space-y-6 text-gray-800 dark:text-slate-300">
          <StepCard
            number="1"
            title="Créer un compte"
            description="Inscrivez-vous gratuitement sur navigoo.cm"
          >
            <CodeBlock
              code={`# Créez votre organisation
curl -X POST https://api.navigoo.cm/api/organizations \\
  -H "Content-Type: application/json" \\
  -d '{
    "organizationName": "Ma Super App",
    "orgType": "MERCHANT",
    "orgCode": "MYAPP001"
  }'`}
              language="bash"
              id="create-org"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </StepCard>

          <StepCard
            number="2"
            title="Obtenir votre clé API"
            description="Authentifiez-vous et récupérez votre token"
          >
            <CodeBlock
              code={`# Login
curl -X POST https://api.navigoo.cm/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "votre@email.cm",
    "password": "VotreMotDePasse123!"
  }'

# Réponse
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}`}
              language="bash"
              id="login"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </StepCard>

          <StepCard
            number="3"
            title="Installer le SDK"
            description={`Installation pour ${os === "windows" ? "Windows" : "Ubuntu/Linux"}`}
          >
            <CodeBlock
              code={os === "windows" 
                ? `# PowerShell (Administrateur)
npm install navigoo-sdk

# Ou avec Yarn
yarn add navigoo-sdk`
                : `# Installation globale
sudo npm install -g navigoo-sdk

# Ou installation locale
npm install navigoo-sdk --save`}
              language="bash"
              id="install"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </StepCard>

          <StepCard
            number="4"
            title="Premier appel API"
            description="Récupérez vos premiers POIs"
          >
            <CodeBlock
              code={`import { NavigooClient } from 'navigoo-sdk';

const client = new NavigooClient({
  apiKey: 'VOTRE_TOKEN_JWT'
});

// Récupérer les POIs de Yaoundé
const pois = await client.getPOIs({
  city: 'Yaoundé',
  category: 'RESTAURANT',
  limit: 10
});

console.log(\`\${pois.length} restaurants trouvés\`);`}
              language="javascript"
              id="first-call"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </StepCard>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <QuickLinkCard
          icon={<Book className="text-blue-400" size={24} />}
          title="Application Web et Mobile"
          description="Guides pas à pas"
          link="https://poi-navigoo.vercel.app/"
        />
        <QuickLinkCard
          icon={<Code className="text-green-400" size={24} />}
          title="Code Examples"
          description="Snippets prêts à l'emploi"
          link="https://poi-navigoo.vercel.app/docs"
        />
        <QuickLinkCard
          icon={<Globe className="text-purple-400" size={24} />}
          title="Swagger de l'API"
          description="Testez en direct"
          link="https://poi-navigoo.pynfi.com/webjars/swagger-ui/index.html#/"
        />
      </div>
    </motion.div>
  );
};

const ApiReference = ({ copyToClipboard, copiedCode }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-8"
  >
    <div className="dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border dark:border-slate-700/50 p-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-2xl">
          <Database className="text-white" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black dark:text-white text-gray-900">Référence API</h2>
          <p className="text-slate-400">Endpoints REST complets</p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* POIs Endpoints */}
        <EndpointSection title="Points d'Intérêt (POIs)">
          <EndpointCard
            method="GET"
            endpoint="/api/pois"
            description="Récupérer tous les POIs"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          >
            <CodeBlock
              code={`GET https://api.navigoo.cm/api/pois
Authorization: Bearer YOUR_TOKEN

Query Parameters:
- city (string): Ville (Yaoundé, Douala, etc.)
- category (string): RESTAURANT, HOTEL, MUSEE, etc.
- limit (number): Nombre de résultats (défaut: 20)
- offset (number): Pagination

Response:
{
  "data": [
    {
      "poi_id": "uuid-123",
      "poi_name": "Hôtel Hilton",
      "poi_type": "HOTEL",
      "latitude": 3.8691,
      "longitude": 11.5126,
      "address_city": "Yaoundé"
    }
  ],
  "total": 156,
  "page": 1
}`}
              language="json"
              id="get-pois"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </EndpointCard>

          <EndpointCard
            method="POST"
            endpoint="/api/pois"
            description="Créer un nouveau POI"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          >
            <CodeBlock
              code={`POST https://api.navigoo.cm/api/pois
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "organization_id": "uuid-org",
  "poi_name": "Restaurant Le Beau Jardin",
  "poi_type": "RESTAURANT",
  "poi_category": "FOOD_DRINK",
  "latitude": 4.0511,
  "longitude": 9.7679,
  "address_city": "Douala",
  "poi_description": "Cuisine camerounaise authentique"
}`}
              language="json"
              id="create-poi"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </EndpointCard>
        </EndpointSection>

        {/* Geocoding */}
        <EndpointSection title="Géocodage">
          <EndpointCard
            method="GET"
            endpoint="/api/pois/search/location"
            description="Recherche par coordonnées GPS"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          >
            <CodeBlock
              code={`GET https://api.navigoo.cm/api/pois/search/location
Authorization: Bearer YOUR_TOKEN

Query Parameters:
- latitude (number): 3.8691
- longitude (number): 11.5126
- radius (number): Rayon en km (défaut: 5)

Response:
{
  "pois": [
    {
      "poi_name": "Monument de la Réunification",
      "distance_km": 0.8,
      "latitude": 3.8691,
      "longitude": 11.5126
    }
  ]
}`}
              language="json"
              id="geocoding"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </EndpointCard>
        </EndpointSection>

        {/* Reviews */}
        <EndpointSection title="Avis & Évaluations">
          <EndpointCard
            method="POST"
            endpoint="/api-reviews"
            description="Poster un avis"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          >
            <CodeBlock
              code={`POST https://api.navigoo.cm/api-reviews
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "poiId": "uuid-poi-123",
  "rating": 5,
  "reviewText": "Excellent service, cuisine délicieuse !",
  "photos": ["url1.jpg", "url2.jpg"]
}

Response:
{
  "review_id": "uuid-review",
  "created_at": "2026-02-05T14:30:00Z",
  "status": "published"
}`}
              language="json"
              id="post-review"
              copyToClipboard={copyToClipboard}
              copiedCode={copiedCode}
            />
          </EndpointCard>
        </EndpointSection>
      </div>
    </div>
  </motion.div>
);

const LibraryDocs = ({ os, copyToClipboard, copiedCode }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-8"
  >
    <div className="dark:bg-slate-800/50 bg-transparent backdrop-blur-xl rounded-3xl border dark:border-slate-700/50 p-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl">
          <Package className="text-white" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black dark:text-white text-gray-900">Navigoo Native</h2>
          <p className="dark:text-slate-400 text-slate-800">Bibliothèque React Native Open Source</p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Installation */}
        <div>
          <h3 className="text-2xl font-bold dark:text-white text-gray-700 mb-4 flex items-center gap-3">
            <Download className="text-purple-400" size={24} />
            Installation
          </h3>
          <CodeBlock
            code={os === "windows"
              ? `# Avec NPM
npm install navigoo-native react-native-maps

# Avec Yarn
yarn add navigoo-native react-native-maps

# Pas besoin de pod install sur Windows
# Seulement si vous développez pour iOS sur Mac`
              : `# Installation
npm install navigoo-native react-native-maps

# Pour iOS (sur Mac uniquement)
cd ios && pod install && cd ..`}
            language="bash"
            id="install-native"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          />
        </div>

        {/* Basic Usage */}
        <div>
          <h3 className="text-2xl font-bold dark:text-white text-gray-700 mb-4 flex items-center gap-3">
            <Map className="text-blue-400" size={24} />
            Utilisation Basique
          </h3>
          <CodeBlock
            code={`import React from 'react';
import { NavigooMap, PointOfInterestData } from 'navigoo-native';

const pois: PointOfInterestData[] = [
  {
    id: '1',
    name: 'Monument de la Réunification',
    category: 'Monument',
    description: 'Symbole historique de Yaoundé',
    coords: [3.8691, 11.5126] // [Latitude, Longitude]
  },
  {
    id: '2',
    name: 'Hôtel Hilton',
    category: 'Hébergement',
    description: 'Hôtel 5 étoiles',
    coords: [3.8676, 11.5213]
  }
];

export default function App() {
  return (
    <NavigooMap
      center={[3.86, 11.51]}
      zoom={13}
      pois={pois}
      onPoiClick={(poi) => {
        console.log('POI sélectionné:', poi.name);
      }}
    />
  );
}`}
            language="typescript"
            id="basic-usage"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          />
        </div>

        {/* Routing */}
        <div>
          <h3 className="text-2xl font-bold mb-4 dark:text-white text-gray-700 flex items-center gap-3">
            <Navigation className="text-green-400" size={24} />
            Calcul d'Itinéraire
          </h3>
          <CodeBlock
            code={`import { useState } from 'react';
import { NavigooMap, RouteInfo } from 'navigoo-native';

export default function RoutingExample() {
  const [route, setRoute] = useState<RouteInfo | null>(null);

  const calculateRoute = () => {
    setRoute({
      start: [3.8691, 11.5126],  // Yaoundé centre
      end: [4.0511, 9.7679]      // Douala
    });
  };

  return (
    <>
      <NavigooMap
        center={[3.9, 10.6]}
        zoom={8}
        pois={[]}
        route={route}  // La carte affiche automatiquement l'itinéraire
      />
      
      <button onClick={calculateRoute}>
        Calculer l'itinéraire
      </button>
    </>
  );
}`}
            language="typescript"
            id="routing"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          />
        </div>

        {/* Utilities */}
        <div>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Settings className="text-yellow-400" size={24} />
            Fonctions Utilitaires
          </h3>
          <CodeBlock
            code={`import { findClosestPoi, getDistance } from 'navigoo-native';

// Trouver le POI le plus proche
const userPosition = [3.86, 11.51];
const closestPoi = findClosestPoi(userPosition, pois);

if (closestPoi) {
  console.log(\`Le plus proche: \${closestPoi.name}\`);
}

// Calculer la distance entre deux points
const distance = getDistance(
  [3.8691, 11.5126],  // Yaoundé
  [4.0511, 9.7679]    // Douala
);

console.log(\`Distance: \${distance.toFixed(2)} km\`);`}
            language="typescript"
            id="utilities"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          />
        </div>
      </div>
    </div>

    {/* Props Reference */}
    <div className="dark:bg-slate-800/50 backdrop-blur-xl  rounded-3xl border dark:border-slate-700/50 p-10">
      <h3 className="text-2xl font-bold mb-6 dark:text-white text-gray-700">Propriétés du Composant</h3>
      
      <div className="space-y-4">
        <PropCard
          name="center"
          type="[number, number]"
          required
          description="Coordonnées du centre de la carte [latitude, longitude]"
          example="[3.86, 11.51]"
        />
        <PropCard
          name="zoom"
          type="number"
          required
          description="Niveau de zoom initial (6 = pays, 13 = ville)"
          example="13"
        />
        <PropCard
          name="pois"
          type="PointOfInterestData[]"
          required
          description="Tableau des points d'intérêt à afficher"
        />
        <PropCard
          name="route"
          type="RouteInfo | null"
          description="Itinéraire à tracer sur la carte"
        />
        <PropCard
          name="highlightedPosition"
          type="[number, number] | null"
          description="Position à mettre en évidence (marqueur bleu)"
        />
        <PropCard
          name="onPoiClick"
          type="(poi: PointOfInterestData) => void"
          description="Callback quand un POI est cliqué"
        />
      </div>
    </div>
  </motion.div>
);

const CompleteExamples = ({ copyToClipboard, copiedCode }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-8"
  >
    <div className="dark:bg-slate-800/50 bg-transparent backdrop-blur-xl rounded-3xl border dark:border-slate-700/50 p-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-600 to-red-600 p-4 rounded-2xl">
          <FileCode className="text-white" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black dark:text-white text-gray-900">Exemples Complets</h2>
          <p className="dark:text-slate-400 text-slate-800">Applications prêtes à l'emploi</p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Example 1: Restaurant Finder */}
        <ExampleCard
          title="Application de Restaurants"
          description="Trouvez les meilleurs restaurants autour de vous"
          tags={["React Native", "API", "Géolocalisation"]}
        >
          <CodeBlock
            code={`import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { NavigooMap, findClosestPoi } from 'navigoo-native';
import { NavigooClient } from 'navigoo-sdk';

export default function RestaurantFinder() {
  const [restaurants, setRestaurants] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    // Initialiser le client API
    const client = new NavigooClient({
      apiKey: 'YOUR_API_TOKEN'
    });

    // Récupérer les restaurants
    const fetchRestaurants = async () => {
      const data = await client.getPOIs({
        category: 'RESTAURANT',
        city: 'Yaoundé',
        limit: 50
      });

      setRestaurants(data.map(r => ({
        id: r.poi_id,
        name: r.poi_name,
        category: 'Restaurant',
        description: r.poi_description,
        coords: [r.latitude, r.longitude]
      })));
    };

    fetchRestaurants();
  }, []);

  // Trouver le restaurant le plus proche
  const findNearest = () => {
    if (userLocation && restaurants.length > 0) {
      const nearest = findClosestPoi(userLocation, restaurants);
      setSelectedRestaurant(nearest);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <NavigooMap
        center={userLocation || [3.86, 11.51]}
        zoom={13}
        pois={restaurants}
        highlightedPosition={userLocation}
        onPoiClick={setSelectedRestaurant}
      />

      <View style={{ 
        position: 'absolute', 
        bottom: 20, 
        left: 20, 
        right: 20 
      }}>
        <TouchableOpacity
          onPress={findNearest}
          style={{
            backgroundColor: '#3B82F6',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Trouver le plus proche
          </Text>
        </TouchableOpacity>

        {selectedRestaurant && (
          <View style={{
            backgroundColor: 'white',
            marginTop: 10,
            padding: 16,
            borderRadius: 12
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              {selectedRestaurant.name}
            </Text>
            <Text style={{ color: '#666', marginTop: 4 }}>
              {selectedRestaurant.description}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}`}
            language="typescript"
            id="restaurant-app"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          />
        </ExampleCard>

        {/* Example 2: Delivery App */}
        <ExampleCard
          title="Application de Livraison"
          description="Calculez des itinéraires et suivez des livraisons"
          tags={["Routing", "Real-time", "OSRM"]}
        >
          <CodeBlock
            code={`import React, { useState } from 'react';
import { NavigooMap, RouteInfo, getDistance } from 'navigoo-native';
import { NavigooClient } from 'navigoo-sdk';

export default function DeliveryApp() {
  const [deliveryRoute, setDeliveryRoute] = useState<RouteInfo | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  const client = new NavigooClient({ apiKey: 'YOUR_TOKEN' });

  const createDelivery = async (restaurantId: string, customerAddress: any) => {
    // Récupérer les détails du restaurant
    const restaurant = await client.getPOI(restaurantId);

    // Créer l'itinéraire
    const route: RouteInfo = {
      start: [restaurant.latitude, restaurant.longitude],
      end: [customerAddress.latitude, customerAddress.longitude]
    };

    // Calculer la distance
    const distance = getDistance(route.start, route.end);
    const estimatedTime = Math.round((distance / 40) * 60); // ~40km/h en ville

    setDeliveryRoute(route);
    setDeliveryInfo({
      restaurant: restaurant.poi_name,
      distance: distance.toFixed(1),
      estimatedTime: estimatedTime,
      status: 'en_route'
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <NavigooMap
        center={[3.86, 11.51]}
        zoom={13}
        pois={[]}
        route={deliveryRoute}
      />

      {deliveryInfo && (
        <View style={{
          position: 'absolute',
          top: 20,
          left: 20,
          right: 20,
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
            Livraison depuis {deliveryInfo.restaurant}
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <View>
              <Text style={{ color: '#666', fontSize: 12 }}>Distance</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#3B82F6' }}>
                {deliveryInfo.distance} km
              </Text>
            </View>
            
            <View>
              <Text style={{ color: '#666', fontSize: 12 }}>Temps estimé</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#10B981' }}>
                {deliveryInfo.estimatedTime} min
              </Text>
            </View>
          </View>

          <View style={{
            marginTop: 12,
            backgroundColor: '#FEF3C7',
            padding: 12,
            borderRadius: 8
          }}>
            <Text style={{ color: '#92400E', fontWeight: '600' }}>
              🚴 Livreur en route
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}`}
            language="typescript"
            id="delivery-app"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          />
        </ExampleCard>

        {/* Example 3: Tourism Guide */}
        <ExampleCard
          title="Guide Touristique"
          description="Explorez les sites touristiques du Cameroun"
          tags={["Tourism", "Reviews", "Multimedia"]}
        >
          <CodeBlock
            code={`import React, { useState, useEffect } from 'react';
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { NavigooMap } from 'navigoo-native';
import { NavigooClient } from 'navigoo-sdk';

export default function TourismGuide() {
  const [attractions, setAttractions] = useState([]);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [reviews, setReviews] = useState([]);

  const client = new NavigooClient({ apiKey: 'YOUR_TOKEN' });

  useEffect(() => {
    loadAttractions();
  }, []);

  const loadAttractions = async () => {
    const data = await client.getPOIs({
      category: 'TOURISM',
      city: 'Yaoundé'
    });

    setAttractions(data.map(a => ({
      id: a.poi_id,
      name: a.poi_name,
      category: a.poi_category,
      description: a.poi_description,
      coords: [a.latitude, a.longitude],
      imageUrl: a.cover_image_url
    })));
  };

  const selectAttraction = async (attraction: any) => {
    setSelectedAttraction(attraction);

    // Charger les avis
    const reviewsData = await client.getReviews(attraction.id);
    setReviews(reviewsData);
  };

  const submitReview = async (rating: number, text: string) => {
    await client.createReview({
      poiId: selectedAttraction.id,
      rating,
      reviewText: text
    });

    // Recharger les avis
    const updated = await client.getReviews(selectedAttraction.id);
    setReviews(updated);
  };

  return (
    <View style={{ flex: 1 }}>
      <NavigooMap
        center={[3.86, 11.51]}
        zoom={12}
        pois={attractions}
        onPoiClick={selectAttraction}
      />

      {selectedAttraction && (
        <ScrollView style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '50%',
          backgroundColor: 'white',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 20
        }}>
          {selectedAttraction.imageUrl && (
            <Image
              source={{ uri: selectedAttraction.imageUrl }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 16,
                marginBottom: 16
              }}
            />
          )}

          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
            {selectedAttraction.name}
          </Text>

          <Text style={{ color: '#666', marginBottom: 16 }}>
            {selectedAttraction.description}
          </Text>

          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Avis ({reviews.length})
          </Text>

          {reviews.map((review, idx) => (
            <View key={idx} style={{
              backgroundColor: '#F9FAFB',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12
            }}>
              <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
                {[...Array(5)].map((_, i) => (
                  <Text key={i} style={{ fontSize: 16 }}>
                    {i < review.rating ? '⭐' : '☆'}
                  </Text>
                ))}
              </View>
              <Text style={{ color: '#374151' }}>
                {review.reviewText}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => submitReview(5, "Magnifique endroit !")}
            style={{
              backgroundColor: '#3B82F6',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 8
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Laisser un avis
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}`}
            language="typescript"
            id="tourism-app"
            copyToClipboard={copyToClipboard}
            copiedCode={copiedCode}
          />
        </ExampleCard>
      </div>
    </div>
  </motion.div>
);

// ============================================
// COMPONENTS
// ============================================

const NavItem = ({ id, label, icon, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
      active 
        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30" 
        : "dark:text-slate-400 text-slate-800 hover:text-white hover:bg-slate-700/50"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StepCard = ({ number, title, description, children }: any) => (
  <div className="relative pl-12">
    <div className="absolute left-0 dark:top-0 top-8 w-8 h-8 bg-gradient-to-br from-purple-900 to-purple-900 rounded-full flex items-center justify-center font-black text-white shadow-lg">
      {number}
    </div>
    <div className="dark:bg-slate-900/50 rounded-2xl p-6 border border-transparent dark:border-slate-700/30">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="dark:text-slate-400 text-slate-600 mb-4 text-sm">{description}</p>
      {children}
    </div>
  </div>
);

const CodeBlock = ({ code, language, id, copyToClipboard, copiedCode }: any) => (
  <div className="relative">
    <div className="absolute top-3 right-3 z-10">
      <button
        onClick={() => copyToClipboard(code, id)}
        className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-all duration-300 flex items-center gap-2"
      >
        {copiedCode === id ? (
          <>
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-xs font-medium">Copié!</span>
          </>
        ) : (
          <>
            <Copy size={16} />
            <span className="text-xs font-medium">Copier</span>
          </>
        )}
      </button>
    </div>
    
    <pre className="bg-slate-950 text-slate-300 p-6 rounded-xl overflow-x-auto border border-slate-800">
      <code className={`language-${language} text-sm`}>{code}</code>
    </pre>
  </div>
);

const QuickLinkCard = ({ icon, title, description, link }: any) => (
  <a
    href={link}
    className="block dark:bg-slate-800/30 hover:bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 border dark:border-slate-700/50 transition-all duration-300 dark:hover:border-blue-500/50 dark:hover:shadow-lg dark:hover:shadow-blue-500/10"
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-bold mb-2 dark:text-white text-gray-700">{title}</h3>
    <p className="text-slate-400 text-sm">{description}</p>
  </a>
);

const EndpointSection = ({ title, children }: any) => (
  <div>
    <h3 className="text-2xl dark:text-white text-gray-700 font-bold mb-6 flex items-center gap-3">
      <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
      {title}
    </h3>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const EndpointCard = ({ method, endpoint, description, children }: any) => {
  const methodColors: any = {
    GET: "bg-blue-600",
    POST: "bg-green-600",
    PUT: "bg-orange-600",
    DELETE: "bg-red-600"
  };

  return (
    <div className="bg-transparent rounded-2xl p-6 border border-transparent">
      <div className="flex items-center gap-3 mb-4">
        <span className={`${methodColors[method]} text-white px-3 py-1 rounded-lg text-sm font-bold`}>
          {method}
        </span>
        <code className="dark:text-blue-400 dark:text-white text-gray-800 font-mono">{endpoint}</code>
      </div>
      <p className="dark:text-slate-400 text-slate-800 mb-4">{description}</p>
      {children}
    </div>
  );
};

const PropCard = ({ name, type, required, description, example }: any) => (
  <div className="dark:bg-slate-900/50 bg-gray-50 rounded-xl p-5 border dark:border-slate-700/30 border-gray-100">
    <div className="flex items-center gap-3 mb-2">
      <code className="text-blue-400 font-mono font-bold">{name}</code>
      <code className="text-slate-500 font-mono text-sm">{type}</code>
      {required && (
        <span className="bg-red-600/20 text-red-400 text-xs px-2 py-1 rounded font-bold">
          requis
        </span>
      )}
    </div>
    <p className="text-slate-400 text-sm mb-2">{description}</p>
    {example && (
      <code className="text-green-400 text-xs">Exemple: {example}</code>
    )}
  </div>
);

const ExampleCard = ({ title, description, tags, children }: any) => (
  <div className="dark:bg-slate-900/50 rounded-2xl p-8 ">
    <div className="mb-6">
      <h3 className="text-2xl font-bold mb-2 dark:text-white text-gray-700">{title}</h3>
      <p className="dark:text-slate-400 text-gray-800 mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag: string, idx: number) => (
          <span key={idx} className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
            {tag}
          </span>
        ))}
      </div>
    </div>
    {children}
  </div>
);