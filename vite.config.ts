import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins:[react()], server:{proxy:{'/api':{target:'https://stateinfoagent-e0fvagdxf6gva7hq.westcentralus-01.azurewebsites.net',changeOrigin:true}}}});
