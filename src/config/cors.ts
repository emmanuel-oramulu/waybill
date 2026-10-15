import { type CorsOptions } from "cors";
const allowedOrigins=process.env.ALLOWED_ORIGINS
	?.split(",")
	.map(o => o.trim())
	.filter(Boolean);

const ALLOWED_ORIGINS=new Set<string>(allowedOrigins)

if(ALLOWED_ORIGINS.size===0) {
	throw new Error(
		"ALLOWED_ORIGINS is not set. Set it to a comma-separated list of origins, "+
		"e.g. ALLOWED_ORIGINS=http://localhost:3000,https://app.example.com",
	);
}

const CORS_CONFIG_OPTIONS: CorsOptions={
	origin: function(origin,callback) {
		if(!origin) return callback(null,true);

		if(ALLOWED_ORIGINS.has(origin)) {
			return callback(null,true);
		}

		console.error(`${origin} is not allowed by `);
		return callback(null,false);
	},

	credentials: true,

	methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],

	allowedHeaders: ["Content-Type","Authorization","X-Requested-With","X-Waybill-Auth"]
}

export default CORS_CONFIG_OPTIONS;