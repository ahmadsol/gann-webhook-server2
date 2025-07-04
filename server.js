const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store recent alerts (in production, use a database)
let alerts = [];
const MAX_ALERTS = 50;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Gann Trading Bot Webhook Server Running',
    alerts_count: alerts.length,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Main webhook endpoint for TradingView
app.post('/webhook/:botId', (req, res) => {
  const { botId } = req.params;
  const webhookData = req.body;
  
  console.log(`📈 Webhook received for bot ${botId}:`, webhookData);
  
  // Process TradingView alert
  const alert = {
    id: Date.now(),
    botId,
    timestamp: new Date().toISOString(),
    data: webhookData,
    processed: false
  };
  
  // Add to alerts array
  alerts.unshift(alert);
  if (alerts.length > MAX_ALERTS) {
    alerts = alerts.slice(0, MAX_ALERTS);
  }
  
  // Process the alert based on Gann principles
  processGannAlert(alert);
  
  res.json({ 
    success: true, 
    message: 'Webhook received successfully',
    alertId: alert.id 
  });
});

// Get recent alerts
app.get('/alerts/:botId?', (req, res) => {
  const { botId } = req.params;
  const filteredAlerts = botId 
    ? alerts.filter(alert => alert.botId === botId)
    : alerts;
    
  res.json({
    alerts: filteredAlerts.slice(0, 20),
    total: filteredAlerts.length
  });
});

// Process Gann-based alerts
function processGannAlert(alert) {
  const data = alert.data;
  
  // Example Gann alert processing
  if (data.message) {
    const message = data.message.toLowerCase();
    
    if (message.includes('section change')) {
      console.log('🔄 Gann Section Change Detected!');
      alert.type = 'SECTION_CHANGE';
      alert.priority = 'HIGH';
    }
    
    if (message.includes('volume climax')) {
      console.log('📊 Volume Climax Detected!');
      alert.type = 'VOLUME_CLIMAX';
      alert.priority = 'HIGH';
    }
    
    if (message.includes('50%') || message.includes('fifty')) {
      console.log('📏 50% Level Alert!');
      alert.type = 'FIFTY_PERCENT';
      alert.priority = 'MEDIUM';
    }
  }
  
  alert.processed = true;
  
  // Here you would implement your trading logic
  // For now, we just log the alert
  console.log(`✅ Alert processed: ${alert.type || 'GENERAL'}`);
}

// Error handling
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Gann Trading Bot Webhook Server running on port ${PORT}`);
  console.log(`📍 Webhook URL: http://localhost:${PORT}/webhook/your-bot-id`);
});
