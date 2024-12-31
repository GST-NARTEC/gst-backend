git pull && pm2 stop gst gst-workers && npx prisma generate && pm2 restart gst gst-workers && pm2 save
