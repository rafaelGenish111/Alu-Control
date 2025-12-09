const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: Number, unique: true },
  clientName: { type: String, required: true },
  clientPhone: String,
  clientEmail: String,
  clientAddress: String,

  // Updated Workflow Statuses (The "Baskets")
  status: {
    type: String,
    enum: [
      'offer',              // הצעת מחיר
      'materials_pending',  // ממתין לחומר (רכש)
      'production',         // בייצור (חומר הגיע)
      'install',            // שלב התקנה (בשימוש כבר בפרונט)
      'ready_for_install',  // סיים ייצור - ממתין לשיבוץ
      'scheduled',          // משובץ ביומן (נשלח למתקינים)
      'pending_approval',   // מתקין סיים - ממתין לאישור מנהל
      'completed'           // סגור סופית
    ],
    default: 'offer'
  },

  workflow: { type: String, enum: ['A', 'B', 'C'], default: 'A' },

  items: [{
    productType: String,
    description: String,
    supplier: { type: String },
    isOrdered: { type: Boolean, default: false },
    isArrived: { type: Boolean, default: false }
  }],

  files: [{
    name: String,
    url: String,
    type: { type: String, enum: ['master_plan', 'document', 'site_photo'] },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // --- NEW: Installation Management Fields ---
  installers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Link to User model (Assign multiple workers)
  }],
  installDateStart: { type: Date }, // Start of installation window
  installDateEnd: { type: Date },   // End of installation window (for multi-day jobs)
  installationNotes: { type: String }, // Special instructions for the team

  timeline: [{
    status: String,
    date: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);