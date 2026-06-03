/**
 * Helper to generate a realistic representation of the user's uploaded invoice document.
 * This is loaded as the initial preset, so the app works beautifully out of the box.
 */
export function generateSampleInvoice(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 1. Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw Table Borders and Lines
  ctx.strokeStyle = "#1e293b"; // Primary slate dark lines
  ctx.lineWidth = 2;

  // Outer document frame
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Table grid lines
  ctx.beginPath();
  // Header dividers
  ctx.moveTo(30, 100);
  ctx.lineTo(canvas.width - 30, 100);
  
  // Columns
  ctx.moveTo(200, 30);
  ctx.lineTo(200, 100);

  ctx.moveTo(450, 30);
  ctx.lineTo(450, 100);

  // Total invoice cost summary line (similar to the image)
  ctx.moveTo(30, 160);
  ctx.lineTo(canvas.width - 30, 160);

  // Horizontal table grids
  ctx.moveTo(30, 260);
  ctx.lineTo(canvas.width - 30, 260);

  ctx.moveTo(30, 360);
  ctx.lineTo(canvas.width - 30, 360);

  ctx.moveTo(30, 460);
  ctx.lineTo(canvas.width - 30, 460);

  ctx.moveTo(30, 520);
  ctx.lineTo(canvas.width - 30, 520);
  ctx.stroke();

  // Subtle grid lines (light gray)
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 100; x < canvas.width - 30; x += 100) {
    if (x === 200 || x === 450) continue;
    ctx.moveTo(x, 30);
    ctx.lineTo(x, 100);
  }
  ctx.stroke();

  // 3. Document Texts (Persian/Arabic)
  ctx.fillStyle = "#0f172a";
  ctx.direction = "rtl";

  // Use elegant font selection falling back to standard Sans Serif
  ctx.font = "bold 16px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("صورت‌حساب فروش کالا و خدمات", canvas.width - 60, 65);
  
  ctx.font = "500 12px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("شماره فاکتور: ۴۰۳۱۲-B", 180, 55);
  ctx.fillText("تاریخ: ۱۴۰۳/۰۸/۱۲", 180, 80);

  // Table Total Sum Row (from the uploaded image)
  // Re-draw background for the sum row (beige similar to the user image)
  ctx.fillStyle = "#fafaf5";
  ctx.fillRect(32, 102, canvas.width - 64, 56);
  ctx.fillStyle = "#0f172a";
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 100, canvas.width - 60, 60);

  ctx.font = "bold 18px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("ریال", 70, 137);
  
  ctx.font = "bold 24px Vazirmatn, Courier, monospace, sans-serif";
  ctx.fillText("۷,۷۸۸,۰۰۰,۰۰۰", 380, 138);

  ctx.font = "bold 14px Vazirmatn, Tahoma, sans-serif";
  ctx.fillStyle = "#dc2626"; // red text for accent "به سبک..."
  ctx.fillText("تعهد ما تولید بهترین‌ها به سبک شماست!!", canvas.width - 60, 315);

  ctx.fillStyle = "#0f172a";
  ctx.font = "500 14px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("بابت تسویه مالی سفارش شماره ۹۸۲-الف", canvas.width - 60, 215);
  ctx.fillText("شماره حساب بانک ملی: ۰۳۰۱۵۷۹۱۲۱۰۰۱", canvas.width - 60, 500);

  // 4. DRAW GORGEOUS SIMULATED BLUE STAMP
  // Blue tone similar to document stamp ink (#3b5998 or #3157a0)
  ctx.save();
  // Translate to stamp center and rotate about -8 degrees to look natural
  ctx.translate(350, 275);
  ctx.rotate(-8 * Math.PI / 180);

  ctx.strokeStyle = "rgba(49, 87, 160, 0.85)";
  ctx.lineWidth = 3.5;
  
  // Double border for stamp feel
  // Outer rectangle with rounded corners
  const rx = -180, ry = -55, rw = 280, rh = 100, radius = 10;
  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, radius);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(rx + 4, ry + 4, rw - 8, rh - 8, radius - 2);
  ctx.stroke();

  // Draw seal Logo (circular on the left)
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-140, -5, 30, 0, Math.PI * 2);
  ctx.stroke();

  // Stylized "e" letter inside the circle logo (similar to user stamp)
  ctx.strokeStyle = "rgba(49, 87, 160, 0.9)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(-140, -5, 15, 0.3 * Math.PI, 1.8 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-150, -5);
  ctx.lineTo(-130, -5);
  ctx.stroke();

  // Stamp Texts
  ctx.fillStyle = "rgba(49, 87, 160, 0.9)";
  ctx.direction = "rtl";
  ctx.font = "bold 15px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("صنایع پلاستیک نگین نوین", -10, -15);
  
  ctx.font = "500 10px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("شماره ثبت: ۱۰۴۸", -15, 10);
  ctx.font = "bold 8px Courier, sans-serif";
  ctx.fillText("Negin Plastic Co.", -14, 30);

  ctx.restore();


  // 5. DRAW GORGEOUS BLACK HANDWRITTEN SIGNATURE (overlapping columns)
  ctx.save();
  ctx.strokeStyle = "rgba(15, 23, 42, 0.95)"; // Deep ink black/navy
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Anchor point at center of right side
  ctx.translate(450, 360);
  ctx.beginPath();

  // Handwritten curves matching the shape in the user's prompt
  ctx.moveTo(100, -100);
  
  // Starting quick downward stroke, looping over, and swinging down of sign
  ctx.bezierCurveTo(70, -80, 60, -30, 80, 20);
  ctx.bezierCurveTo(90, 45, 130, 100, 150, 140);
  
  // Big sweep left and up (the visual crossing loop)
  ctx.bezierCurveTo(50, 120, -150, 20, -50, -50);
  ctx.bezierCurveTo(0, -80, 150, -10, 150, 100);
  ctx.bezierCurveTo(150, 150, 60, 180, -200, 120);

  ctx.stroke();

  // Sub-tick lines for the signature
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-50, 0);
  ctx.quadraticCurveTo(-110, -10, -160, 10);
  ctx.stroke();

  ctx.restore();

  // 6. Draw some noise/texture overlays to mimic scanner feel (subtle)
  ctx.fillStyle = "rgba(0, 0, 0, 0.01)";
  for (let i = 0; i < 200; i++) {
    const nx = Math.random() * canvas.width;
    const ny = Math.random() * canvas.height;
    const nw = Math.random() * 2 + 1;
    ctx.fillRect(nx, ny, nw, nw);
  }

  return canvas.toDataURL("image/png");
}

export function generateSampleContract(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border frame
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
  ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

  // Content
  ctx.fillStyle = "#0f172a";
  ctx.direction = "rtl";

  ctx.font = "bold 18px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("قرارداد فیمابین واگذاری امتیاز نمایندگی رسمی", canvas.width - 70, 90);

  ctx.font = "bold 12px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("کد پیگیری قرارداد: ۱۲۸-ت-۹۸", 100, 85);

  ctx.font = "500 13px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("ماده ۱: طرفین قرارداد", canvas.width - 70, 150);
  ctx.font = "300 12px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("شرکت توسعه افزار نوین به نمایندگی جناب آقای مهندس احمدی از یک سو (واگذارکننده)", canvas.width - 90, 180);
  ctx.fillText("و شرکت سهامی پتروشیمی ماندگار به نمایندگی جناب آقای امیری از سوی دیگر (گیرنده نمایندگی)", canvas.width - 90, 210);

  ctx.font = "500 13px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("ماده ۲: موضوع اصلی واگذاری امتیاز", canvas.width - 70, 260);
  ctx.font = "300 12px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("حق امتیاز توزیع انحصاری لوله‌های پلی‌اتیلن تقویت‌شده در نواحی مرکزی کشور.", canvas.width - 90, 290);

  ctx.font = "500 13px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("محل امضا و گواهی اصالت طرفین معامله:", canvas.width - 70, 400);

  // Write "مهر شرکت خریدار" and "مهر شرکت فروشنده" labels at bottom
  ctx.font = "bold 12px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("امضا و تایید طرف اول", 180, 440);
  ctx.fillText("مهر و گواهی طرف دوم", 580, 440);

  // Draw RED STAMP on the left side
  ctx.save();
  ctx.translate(560, 490);
  ctx.rotate(5 * Math.PI / 180);
  ctx.strokeStyle = "rgba(220, 38, 38, 0.85)"; // Deep Red
  ctx.lineWidth = 3;
  
  // Round outer circle stamp
  ctx.beginPath();
  ctx.arc(0, 0, 45, 0, Math.PI * 2);
  ctx.stroke();

  // Internal star & stamp text
  ctx.font = "bold 9px Vazirmatn, Tahoma, sans-serif";
  ctx.fillStyle = "rgba(220, 38, 38, 0.85)";
  ctx.fillText("شرکت توسعه افزار نوین", 35, -5);
  ctx.fillText("سهامی خاص - ثبت ۲۸", 35, 12);
  ctx.restore();

  // Draw Signature on the right side
  ctx.save();
  ctx.translate(180, 490);
  ctx.strokeStyle = "rgba(15, 23, 42, 0.9)"; // Ink
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-60, -20);
  ctx.bezierCurveTo(-30, -50, 40, -40, 20, 10);
  ctx.bezierCurveTo(0, 40, -80, 50, -40, -10);
  ctx.bezierCurveTo(-10, -50, 60, 20, 80, -20);
  ctx.stroke();
  ctx.restore();

  return canvas.toDataURL("image/png");
}

export function generateSampleLease(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Greenish theme background border to look like real deed
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative Deed borders (elegant double line thin/thick)
  ctx.strokeStyle = "#16a34a"; // Green border
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  ctx.strokeStyle = "#84cc16";
  ctx.lineWidth = 1;
  ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);

  ctx.fillStyle = "#0f172a";
  ctx.direction = "rtl";

  ctx.font = "bold 16px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("سند مالکیت تک‌برگ ملک غیرمنقول مسکونی", canvas.width - 70, 75);

  ctx.font = "400 11px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("شماره دفترچه: ۹۸۷۱۵ / الف", 100, 70);

  // Table grid parameters
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 120, canvas.width - 100, 240);

  // Vertical lines
  ctx.beginPath();
  ctx.moveTo(180, 120); ctx.lineTo(180, 360);
  ctx.moveTo(400, 120); ctx.lineTo(400, 360);
  ctx.stroke();

  // Text values
  ctx.font = "bold 12px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("بخش ثبتی: تهران پارس", canvas.width - 70, 150);
  ctx.fillText("پلاک اصلی: ۷۶۸۳", 380, 150);
  ctx.fillText("مساحت اعیان: ۷۵.۴ متر مربع", 160, 150);

  ctx.fillText("نام مالک: مریم السادات طباطبایی", canvas.width - 70, 220);
  ctx.fillText("کد ملی: ۰۰۱۷۹۲۸۱۳۷", 380, 220);

  ctx.fillText("آدرس: تهران، انتهای خیابان دماوند، پلاک ۴۴", canvas.width - 70, 290);

  ctx.font = "500 12px Vazirmatn, Tahoma, sans-serif";
  ctx.fillText("گواهی و امضای نماینده اداره ثبت اسناد رسمی کشور:", canvas.width - 70, 410);

  // Blue stamp of justice
  ctx.save();
  ctx.translate(560, 480);
  ctx.rotate(-12 * Math.PI / 180);
  ctx.strokeStyle = "rgba(29, 78, 216, 0.9)"; // Dark Blue
  ctx.lineWidth = 3;
  ctx.strokeRect(-50, -40, 100, 80);

  ctx.strokeStyle = "rgba(29, 78, 216, 0.7)";
  ctx.lineWidth = 1;
  ctx.strokeRect(-45, -35, 90, 70);

  ctx.font = "bold 9px Vazirmatn, Tahoma, sans-serif";
  ctx.fillStyle = "rgba(29, 78, 216, 0.9)";
  ctx.fillText("اداره ثبت اسناد", 35, -15);
  ctx.fillText("ناحیه شرق تهران", 34, 5);
  ctx.fillText("دفتر اسناد رسمی", 35, 23);
  ctx.restore();

  // Stylized legal system signature
  ctx.save();
  ctx.translate(220, 480);
  ctx.strokeStyle = "rgba(30, 41, 59, 1)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(60, -30);
  ctx.quadraticCurveTo(-60, -40, -50, 10);
  ctx.quadraticCurveTo(0, 50, 40, -10);
  ctx.quadraticCurveTo(-10, -60, -90, -40);
  ctx.stroke();
  ctx.restore();

  return canvas.toDataURL("image/png");
}
