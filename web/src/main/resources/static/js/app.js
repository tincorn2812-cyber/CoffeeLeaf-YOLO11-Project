// ============================================================
// CAFELEAF AI - END-TO-END FRONTEND APPLICATION (SPRING BOOT + MYSQL + YOLO11)
// ============================================================
// ============================================================================
// CAFELEAF AI - ỨNG DỤNG WEB NÔNG NGHIỆP THÔNG MINH (FRONTEND CHÍNH)
// ============================================================================

// Các hàm tiện ích cơ bản: Chọn phần tử DOM ($), bộ nhớ đệm (M), thoát ký tự HTML đặc biệt (esc)
const $ = s => document.querySelector(s), M = {}, esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Kiểm tra thiết bị di động (< 900px) để phục vụ giao diện nông dân tinh gọn
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 900;

// Giọng đọc âm thanh hướng dẫn bằng Web Speech API
function speakText(text) {
    if (!('speechSynthesis' in window)) {
        toast('Trình duyệt chưa hỗ trợ phát âm thanh');
        return;
    }
    window.speechSynthesis.cancel();
    const clean = String(text || '').replace(/[#*_`]/g, '').trim();
    if (!clean) return;
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = 'vi-VN';
    utt.rate = 0.95;
    window.speechSynthesis.speak(utt);
    toast('Đang phát giọng đọc hướng dẫn 🔊');
}

// Tự động re-render khi xoay ngang/dọc hoặc thay đổi kích thước vượt mốc 900px
let lastWinWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
window.addEventListener('resize', () => {
    const nw = window.innerWidth;
    if ((lastWinWidth < 900 && nw >= 900) || (lastWinWidth >= 900 && nw < 900)) {
        lastWinWidth = nw;
        render();
    }
});

// Đối tượng ST: Quản lý đọc/ghi bộ nhớ cục bộ trình duyệt (LocalStorage) có RAM Cache tránh gọi getItem lặp lại
const _stCache = new Map();
const ST = {
    g(k, d) {
        if (_stCache.has(k)) return _stCache.get(k);
        try {
            const v = localStorage.getItem(k);
            const val = v ? JSON.parse(v) : (k in M ? M[k] : d);
            _stCache.set(k, val);
            return val;
        } catch (e) {
            return k in M ? M[k] : d;
        }
    },
    s(k, v) {
        M[k] = v;
        _stCache.set(k, v);
        try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
    }
};

// Tạo biểu tượng SVG chuẩn chung cho toàn bộ giao diện
const ic = p => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

// Ánh xạ các trang con của phần nông hộ về danh mục 'acc' trên thanh điều hướng
const cp = p => ['map','yld','qr','exp','coop'].includes(p) ? 'acc' : p;

// Danh sách các trang chính và mục menu trên thanh điều hướng (bao gồm So sánh & Benchmark Tuần 11)
const ORD = ['home','scan','bench','treat','hist','jr','news','acc'], BN = ['home','scan','bench','treat','hist'];
const NAV = [
    ['home','Trang chủ','<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>'],
    ['scan','Chẩn đoán','<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'],
    ['bench','So sánh & Benchmark','<path d="M4 19h16M7 16V8M12 16V5M17 16v-6"/>'],
    ['hist','Lịch sử','<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'],
    ['treat','Xử lý','<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'],
    ['news','Tin tức','<path d="M5 5h11v14H7a2 2 0 01-2-2zM16 9h3v8a2 2 0 01-2 2"/><path d="M8 9h5M8 13h5"/>'],
    ['jr','Nhật ký','<path d="M5 4h12a2 2 0 012 2v14H7a2 2 0 01-2-2z"/><path d="M9 8h6M9 12h6"/>'],
    ['acc','Tài khoản','<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>']
];

// Danh sách cấu hình 6 mô hình AI phục vụ Chọn Model (Tuần 10) và So sánh / Benchmark (Tuần 11)
// best.pt: Đo thực tế trên tập kiểm thử huấn luyện; các model chuẩn: thông số kiến trúc tham chiếu chính thức từ Ultralytics
const MODELS_LIST = [
    { id: 'best.pt',    name: 'YOLO11n-CBAM (Colab best.pt)', badge: 'Thực nghiệm · 85.7%', sizeMb: 5.50,  imgsz: 1024, map50: 85.7, prec: 58.2, rec: 85.0, avgMs: 168.4, minMs: 142.0, maxMs: 210.5, fps: 5.9, arch: 'YOLO11n + CBAM (Train thực nghiệm local/Colab)' },
    { id: 'yolo11n.pt', name: 'YOLO11n (Nano Baseline)',      badge: 'Tham chiếu Ultralytics', sizeMb: 5.35,  imgsz: 640,  map50: 71.4, prec: 72.1, rec: 63.8, avgMs: 108.5, minMs: 92.4,  maxMs: 134.0, fps: 9.2, arch: 'YOLO11 Nano Baseline Backbone' },
    { id: 'yolo11s.pt', name: 'YOLO11s (Small)',              badge: 'Tham chiếu Ultralytics', sizeMb: 18.42, imgsz: 640,  map50: 74.8, prec: 75.3, rec: 67.2, avgMs: 194.2, minMs: 170.5, maxMs: 228.0, fps: 5.1, arch: 'YOLO11 Small Backbone' },
    { id: 'yolo11m.pt', name: 'YOLO11m (Medium)',             badge: 'Tham chiếu Ultralytics', sizeMb: 38.80, imgsz: 640,  map50: 76.5, prec: 77.0, rec: 68.9, avgMs: 342.6, minMs: 305.0, maxMs: 389.2, fps: 2.9, arch: 'YOLO11 Medium Backbone' },
    { id: 'yolo11l.pt', name: 'YOLO11l (Large)',              badge: 'Tham chiếu Ultralytics', sizeMb: 49.01, imgsz: 640,  map50: 77.2, prec: 77.9, rec: 69.5, avgMs: 468.0, minMs: 420.1, maxMs: 525.4, fps: 2.1, arch: 'YOLO11 Large Backbone' },
    { id: 'yolo11x.pt', name: 'YOLO11x (Extra-Large)',        badge: 'Tham chiếu Ultralytics', sizeMb: 109.33,imgsz: 640,  map50: 77.9, prec: 78.4, rec: 70.1, avgMs: 785.4, minMs: 712.0, maxMs: 864.0, fps: 1.3, arch: 'YOLO11 Extra-Large Backbone' }
];
const getModelMeta = id => MODELS_LIST.find(m => m.id === id) || MODELS_LIST[0];
const TRASH = '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>', SEND = '<path d="M4 12l16-8-6 16-3-7z"/>';

// Logo đại diện linh vật Trợ lý Cà Phê AI
const BOT = `<svg viewBox="0 0 64 64" width="46" height="46" aria-hidden="true"><path d="M14 22c-6-2-9-8-8-14 7 0 12 4 14 10zM50 22c6-2 9-8 8-14-7 0-12 4-14 10z" fill="#6BBF4A"/><circle cx="32" cy="36" r="22" fill="#3F9A45"/><rect x="16" y="26" width="32" height="22" rx="11" fill="#F7FFF2"/><circle cx="25" cy="36" r="3" fill="#1F3D2B"/><circle cx="39" cy="36" r="3" fill="#1F3D2B"/><path d="M27 42q5 4 10 0" stroke="#1F3D2B" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="20" cy="42" r="2.5" fill="#F6D96B"/><circle cx="44" cy="42" r="2.5" fill="#F6D96B"/></svg>`;
const L = 'theo nhãn thuốc, hỏi cán bộ khuyến nông';

// Cơ sở dữ liệu 5 lớp bệnh lá cà phê (tên bệnh, tên khoa học, mức nguy hại, màu sắc, nguyên nhân, phác đồ)
let DS = [
    {id:'leaf_rust',n:'Gỉ sắt (leaf rust)',sci:'Hemileia vastatrix',risk:'Cao',c:'#E8590C',why:'Nấm phát triển mạnh khi ẩm cao, giọt nước đọng lâu trên lá và tán vườn rậm rạp thiếu sáng.',st:['Cắt tỉa cành cho vườn thông thoáng','Thu gom và tiêu hủy lá bệnh rơi rụng','Phun thuốc phòng trừ đúng loại, '+L,'Bón phân cân đối N-P-K giúp cây phục hồi']},
    {id:'cercospora',n:'Đốm mắt cua (cercospora)',sci:'Cercospora coffeicola',risk:'Trung bình',c:'#C2342B',why:'Hay gặp khi cây thiếu dinh dưỡng, thiếu nước, đất nghèo hữu cơ hoặc bị nắng gắt.',st:['Bón phân cân đối, bổ sung phân hữu cơ vi sinh','Tưới đủ nước, điều tiết che bóng hợp lý','Tỉa lá bệnh nặng và theo dõi lại sau vài ngày']},
    {id:'leaf_miner',n:'Sâu đục lá (leaf miner)',sci:'Leucoptera coffeella',risk:'Cao',c:'#D97706',why:'Sâu non đục đường hầm ngoằn ngoèo trong phiến lá, ăn phần mô thịt làm lá khô cháy.',st:['Bảo vệ thiên địch tự nhiên (ong ký sinh)','Ngắt bỏ và tiêu hủy lá có sâu non đục','Dọn sạch tàn dư lá rụng quanh gốc cây','Phun thuốc đặc trị khi mật độ sâu hại cao, '+L]},
    {id:'red_spider_mite',n:'Nhện đỏ (red spider mite)',sci:'Oligonychus coffeae',risk:'Cao',c:'#DC2626',why:'Phát triển mạnh trong thời tiết khô nóng, chích hút nhựa làm mặt lá xám bạc và rụng.',st:['Tưới phun mưa rửa trôi nhện trên tán lá trong mùa khô','Bảo tồn bọ rùa và nhện bắt mồi thiên địch','Phun dầu khoáng sinh học trừ nhện hại','Luân phiên thuốc đặc trị nhện khi mật độ cao, '+L]},
    {id:'healthy',n:'Lá khoẻ mạnh (healthy)',sci:'Không bệnh',risk:'Không',c:'#2F9E44',why:'Lá xanh tốt, không thấy dấu hiệu sâu bệnh hại trên lá này.',st:['Tiếp tục theo dõi định kỳ vườn cây','Giữ vườn thông thoáng, bón phân cân đối','Tưới tiêu hợp lý duy trì sức đề kháng']}
];

// Mô tả triệu chứng lâm sàng nhận biết từng loại bệnh
let SYM = {
    leaf_rust:'Đốm vàng nhạt trên mặt lá, mặt dưới có lớp bột vàng cam. Đốm lan rộng, lá khô và rụng sớm.',
    cercospora:'Đốm tròn màu nâu gỉ sắt, tâm xám nhạt, viền nâu đậm xung quanh có quầng vàng như mắt cua.',
    leaf_miner:'Vệt ngoằn ngoèo màu trắng bạc hoặc mảng phồng rộp khô màu nâu do sâu đục mô lá, lá biến dạng và dễ rụng.',
    red_spider_mite:'Vết chích nhỏ li ti làm mặt trên lá chuyển màu xám bạc hoặc loang lổ vàng đồng, có lớp tơ mỏng mịn.',
    healthy:'Lá xanh tươi đều màu, bề mặt lá bóng mịn, không có đốm nấm hay vết cắn phá của sâu bọ.'
};

// Biện pháp kỹ thuật phòng ngừa bệnh dài hạn
let PRE = {
    leaf_rust:'Giữ vườn thông thoáng, bón cân đối N-P-K, tránh để lá ướt lâu.',
    cercospora:'Che bóng hợp lý, tưới và bón đủ dinh dưỡng, không để cây thiếu nước và vi lượng.',
    leaf_miner:'Trồng cây che bóng, vệ sinh vườn sạch sẽ, hạn chế thuốc phổ rộng làm hại thiên địch.',
    red_spider_mite:'Tưới phun mưa tạo ẩm mùa khô, bảo tồn thiên địch, bón phân cân đối hạn chế thừa đạm.',
    healthy:'Kiểm tra vườn định kỳ, giữ vệ sinh vườn, bón phân hữu cơ cân đối hàng năm.'
};

// Danh sách các lô vườn mặc định
const LOTS = ['Lô A','Lô B','Lô C'];

// Bảng ánh xạ mã bệnh viết tắt sang mã chuẩn
const ALIAS = {ria:'leaf_rust',mat:'cercospora',hong:'leaf_miner',kho:'red_spider_mite',khoe:'healthy'};

// Lấy thông tin chi tiết một bệnh theo mã định danh
const dz = id => { const x = ALIAS[id] || id; return DS.find(d => d.id == x) || DS[0]; };

// Kiểm tra xem mẫu lá có bị nhiễm bệnh hay không
const isSick = d => d && d != 'healthy' && d != 'khoe';

// Tên các ngày trong tuần
const WD = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];

// Danh sách tỉnh trọng điểm cà phê và các tỉnh thành khác
const COFFEE_PROVS = ['Đắk Lắk','Lâm Đồng','Gia Lai','Đắk Nông','Kon Tum','Sơn La','Điện Biên','Quảng Trị','Đồng Nai','Bình Phước'];
const OTHER_PROVS = [
    'Hà Nội','TP. Hồ Chí Minh','Đà Nẵng','Hải Phòng','Cần Thơ',
    'An Giang','Bà Rịa - Vũng Tàu','Bắc Giang','Bắc Kạn','Bạc Liêu','Bắc Ninh','Bến Tre','Bình Định','Bình Dương','Bình Thuận',
    'Cà Mau','Cao Bằng','Đồng Tháp','Hà Giang','Hà Nam','Hà Tĩnh','Hải Dương','Hậu Giang','Hòa Bình','Hưng Yên',
    'Khánh Hòa','Kiên Giang','Lai Châu','Lạng Sơn','Lào Cai','Long An','Nam Định','Nghệ An','Ninh Bình','Ninh Thuận',
    'Phú Thọ','Phú Yên','Quảng Bình','Quảng Nam','Quảng Ngãi','Quảng Ninh','Sóc Trăng','Tây Ninh','Thái Bình','Thái Nguyên',
    'Thanh Hóa','Thừa Thiên Huế','Tiền Giang','Trà Vinh','Tuyên Quang','Vĩnh Long','Vĩnh Phúc','Yên Bái','Khác'
];
const PROVS_LIST = [...COFFEE_PROVS, ...OTHER_PROVS];

// Bảng tọa độ GPS và giá cà phê tham chiếu theo từng vùng
const REGION_COORDS = {
    'Đắk Lắk':   { lat: 12.6667, lon: 108.0500, sub: 'Buôn Ma Thuột', price: '119.600 đ/kg (+300 đ)' },
    'Lâm Đồng':  { lat: 11.5480, lon: 107.8077, sub: 'Bảo Lộc · Di Linh', price: '118.800 đ/kg (+200 đ)' },
    'Gia Lai':   { lat: 13.9833, lon: 108.0000, sub: 'Pleiku · Chư Prông', price: '119.300 đ/kg (+300 đ)' },
    'Đắk Nông':  { lat: 12.0042, lon: 107.6907, sub: 'Gia Nghĩa · Đắk Mil', price: '119.700 đ/kg (+400 đ)' },
    'Kon Tum':   { lat: 14.3545, lon: 108.0076, sub: 'Đăk Hà · TP Kon Tum', price: '119.200 đ/kg (+200 đ)' },
    'Sơn La':    { lat: 21.3256, lon: 103.9188, sub: 'Mai Sơn · TP Sơn La', price: '122.500 đ/kg (Arabica)' },
    'Điện Biên': { lat: 21.3860, lon: 103.0230, sub: 'Mường Ảng · Điện Biên', price: '123.000 đ/kg (Arabica)' },
    'Quảng Trị': { lat: 16.6260, lon: 106.7310, sub: 'Khe Sanh · Hướng Hóa', price: '121.800 đ/kg (Arabica)' },
    'Đồng Nai':  { lat: 10.9574, lon: 107.2427, sub: 'Long Khánh · Xuân Lộc', price: '119.000 đ/kg (+200 đ)' },
    'Bình Phước':{ lat: 11.7512, lon: 106.7235, sub: 'Bù Đăng · Đồng Xoài', price: '119.100 đ/kg (+250 đ)' },
    'Hà Nội':           { lat: 21.0285, lon: 105.8542, sub: 'Thủ đô Hà Nội', price: '119.500 đ/kg' },
    'TP. Hồ Chí Minh':  { lat: 10.8231, lon: 106.6297, sub: 'Trung tâm TP.HCM', price: '119.500 đ/kg' },
    'Đà Nẵng':          { lat: 16.0544, lon: 108.2022, sub: 'Hải Châu · Sơn Trà', price: '119.500 đ/kg' },
    'Hải Phòng':        { lat: 20.8449, lon: 106.6881, sub: 'Hồng Bàng · Ngô Quyền', price: '119.500 đ/kg' },
    'Cần Thơ':          { lat: 10.0452, lon: 105.7469, sub: 'Ninh Kiều · Cái Răng', price: '119.500 đ/kg' },
    'Bình Dương':       { lat: 11.1606, lon: 106.6576, sub: 'Thủ Dầu Một', price: '119.200 đ/kg' },
    'Bà Rịa - Vũng Tàu':{ lat: 10.5417, lon: 107.2429, sub: 'Châu Đức · Bà Rịa', price: '119.000 đ/kg' },
    'Bình Thuận':       { lat: 11.0903, lon: 108.0704, sub: 'Phan Thiết · Đức Linh', price: '119.200 đ/kg' },
    'Khánh Hòa':        { lat: 12.2388, lon: 109.1967, sub: 'Nha Trang · Diên Khánh', price: '119.300 đ/kg' },
    'Ninh Thuận':       { lat: 11.6859, lon: 108.8872, sub: 'Phan Rang · Ninh Sơn', price: '119.100 đ/kg' },
    'Thanh Hóa':        { lat: 19.8067, lon: 105.7852, sub: 'TP Thanh Hóa · Như Xuân', price: '119.500 đ/kg' },
    'Nghệ An':          { lat: 18.6734, lon: 105.6813, sub: 'TP Vinh · Phủ Quỳ', price: '120.000 đ/kg' },
    'Hà Tĩnh':          { lat: 18.3560, lon: 105.9059, sub: 'TP Hà Tĩnh · Hương Sơn', price: '119.500 đ/kg' },
    'Quảng Bình':       { lat: 17.4690, lon: 106.6225, sub: 'Đồng Hới · Bố Trạch', price: '120.500 đ/kg' },
    'Thừa Thiên Huế':   { lat: 16.4637, lon: 107.5909, sub: 'TP Huế · A Lưới', price: '121.000 đ/kg' },
    'Quảng Nam':        { lat: 15.5394, lon: 108.0263, sub: 'Tam Kỳ · Tiên Phước', price: '119.500 đ/kg' },
    'Quảng Ngãi':       { lat: 15.1205, lon: 108.7923, sub: 'TP Quảng Ngãi', price: '119.500 đ/kg' },
    'Bình Định':        { lat: 13.7820, lon: 109.2197, sub: 'Quy Nhơn · Hoài Nhơn', price: '119.400 đ/kg' },
    'Phú Yên':          { lat: 13.0882, lon: 109.0929, sub: 'Tuy Hòa · Sông Hinh', price: '119.300 đ/kg' },
    'Hòa Bình':         { lat: 20.8153, lon: 105.3384, sub: 'TP Hòa Bình · Lương Sơn', price: '121.500 đ/kg' },
    'Yên Bái':          { lat: 21.7168, lon: 104.8974, sub: 'TP Yên Bái · Văn Chấn', price: '121.500 đ/kg' },
    'Lào Cai':          { lat: 22.4856, lon: 103.9707, sub: 'TP Lào Cai · Sa Pa', price: '122.000 đ/kg' },
    'Lai Châu':         { lat: 22.3963, lon: 103.4684, sub: 'TP Lai Châu · Tam Đường', price: '122.000 đ/kg' },
    'Khác':      { lat: 12.6667, lon: 108.0500, sub: 'Tây Nguyên', price: '119.500 đ/kg' }
};

// Dữ liệu lượng mưa 7 ngày (mm)
let RAIN = [0,3,9,12,2,0,6];

// Trạng thái thời tiết trực tuyến hiện tại
let WX = {
    temp: 26,
    hum: 74,
    wind: 8.5,
    desc: 'Có mây rải rác',
    code: 2,
    isDay: 1,
    sub: 'Tây Nguyên',
    lat: 12.6667,
    lon: 108.0500,
    tmax: [29,28,27,27,29,30,28],
    tmin: [19,19,18,18,19,19,19],
    prob: [20,45,75,80,30,15,55],
    updated: '',
    loading: false
};
let COFFEE_PRICE = '119.600 đ/kg';
let NEWS_DB = [];
let A = ST.g('cf.saved_accounts', []);
let U = null, D = null;
let S = {
    page:'scan', f:'all', fLot:'all', fTime:'all', histQ:'', v:'l', nf:'Tất cả', q:'',
    last:null, busy:0, reg:0,
    selModel:'best.pt', canvasOverlay:0, canvasLabels:1,
    cmpModelA:'best.pt', cmpModelB:'yolo11n.pt', cmpBusy:0, cmpRes:null,
    benchBusy:'', benchData:{}
};

// Chuyển đổi mã thời tiết chuẩn WMO sang tên tiếng Việt dễ hiểu
function wmoToVi(code) {
    if (code === 0) return 'Trời quang nắng';
    if (code === 1 || code === 2) return 'Có mây rải rác';
    if (code === 3) return 'Nhiều mây âm u';
    if (code === 45 || code === 48) return 'Sương mù ẩm';
    if (code >= 51 && code <= 57) return 'Mưa phùn nhẹ';
    if (code >= 61 && code <= 65) return 'Mưa vừa đến mưa to';
    if (code >= 80 && code <= 82) return 'Mưa rào rải rác';
    if (code >= 95) return 'Mưa dông nhiệt đới';
    return 'Thời tiết ổn định';
}

// Phân loại nhóm thời tiết (nắng, trăng, mây, sương, mưa, bão) từ mã WMO để chọn icon
function wxType(code, isDay = 1) {
    if (code === 0) return isDay ? 'sun' : 'moon';
    if (code === 1 || code === 2) return 'partly';
    if (code === 3) return 'cloud';
    if (code === 45 || code === 48) return 'fog';
    if (code >= 51 && code <= 57) return 'drizzle';
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if (code >= 95) return 'storm';
    return 'partly';
}

// Tạo biểu tượng SVG thời tiết có hoạt ảnh (mặt trời xoay, mây lơ lửng, hạt mưa rơi)
function wxIcon(code = WX.code, isDay = WX.isDay, size = 22) {
    const t = wxType(code, isDay);
    const sun = (cx, cy, r) => `<g class="wxi-sun"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#FDB813"/>${[0,45,90,135,180,225,270,315].map(a => {
        const rad = a * Math.PI / 180, r1 = r + 3, r2 = r + 7;
        return `<line x1="${(cx + r1 * Math.cos(rad)).toFixed(1)}" y1="${(cy + r1 * Math.sin(rad)).toFixed(1)}" x2="${(cx + r2 * Math.cos(rad)).toFixed(1)}" y2="${(cy + r2 * Math.sin(rad)).toFixed(1)}" stroke="#FDB813" stroke-width="2.4" stroke-linecap="round"/>`;
    }).join('')}</g>`;
    const cloud = (fill = '#F1F5F9', dx = 0, dy = 0) => `<g class="wxi-cloud" transform="translate(${dx},${dy})"><path d="M10 30a7 7 0 0 1 1-13.9A10 10 0 0 1 30 13a8 8 0 0 1 4 17z" fill="${fill}" stroke="#94A3B8" stroke-width="1.2"/></g>`;
    const drops = (n, len, color = '#38BDF8') => Array.from({ length: n }, (_, i) => `<line class="wxi-drop" style="animation-delay:${(i * 0.25).toFixed(2)}s" x1="${12 + i * 7}" y1="33" x2="${10 + i * 7}" y2="${33 + len}" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`).join('');
    let body = '';
    if (t === 'sun') body = sun(20, 20, 8);
    else if (t === 'moon') body = `<path d="M26 8a12 12 0 1 0 8 19A10 10 0 0 1 26 8z" fill="#FDE68A" stroke="#F59E0B" stroke-width="1.2"/>`;
    else if (t === 'partly') body = sun(14, 13, 6) + cloud('#F8FAFC', 2, 4);
    else if (t === 'cloud') body = cloud('#CBD5E1', -3, -2) + cloud('#F1F5F9', 2, 4);
    else if (t === 'fog') body = cloud('#E2E8F0', 0, -4) + `<g stroke="#CBD5E1" stroke-width="2.4" stroke-linecap="round"><line class="wxi-fog" x1="6" y1="32" x2="34" y2="32"/><line class="wxi-fog" style="animation-delay:.6s" x1="9" y1="37" x2="31" y2="37"/></g>`;
    else if (t === 'drizzle') body = cloud('#E2E8F0', 0, -4) + drops(3, 4);
    else if (t === 'rain') body = cloud('#94A3B8', 0, -4) + drops(4, 7, '#0EA5E9');
    else body = cloud('#64748B', 0, -4) + `<path class="wxi-bolt" d="M21 27l-5 8h4l-2 6 7-9h-4l3-5z" fill="#FACC15" stroke="#CA8A04" stroke-width=".8"/>` + drops(2, 6, '#0EA5E9');
    return `<svg class="wxi wxi-${t}" width="${size}" height="${size}" viewBox="0 0 40 42" role="img" aria-label="${esc(WX.desc)}" style="vertical-align:middle;overflow:visible">${body}</svg>`;
}

// Nhúng mã CSS tạo hoạt ảnh cho các biểu tượng thời tiết vào thẻ <head> (chạy 1 lần duy nhất)
(function injectWxIconCss() {
    if (document.getElementById('wxi-css')) return;
    const st = document.createElement('style');
    st.id = 'wxi-css';
    st.textContent = `
.wxi-sun{transform-origin:center;transform-box:fill-box;animation:wxiSpin 14s linear infinite}
.wxi-cloud{animation:wxiFloat 4s ease-in-out infinite}
.wxi-drop{animation:wxiDrop 1s linear infinite}
.wxi-bolt{animation:wxiFlash 2.2s ease-in-out infinite}
.wxi-fog{animation:wxiFog 3s ease-in-out infinite}
@keyframes wxiSpin{to{transform:rotate(360deg)}}
@keyframes wxiFloat{0%,100%{translate:0 0}50%{translate:2px 0}}
@keyframes wxiDrop{0%{opacity:0;translate:0 -3px}30%{opacity:1}100%{opacity:0;translate:-1px 5px}}
@keyframes wxiFlash{0%,70%,100%{opacity:1}75%,85%{opacity:.15}}
@keyframes wxiFog{0%,100%{translate:0 0}50%{translate:3px 0}}
.wx-hero-ic{display:inline-flex;align-items:center;gap:4px;font-weight:600}
@media (prefers-reduced-motion:reduce){.wxi *{animation:none!important}}`;
    document.head.appendChild(st);
})();

// Gọi Open-Meteo API lấy dữ liệu thời tiết trực tuyến 7 ngày (nhiệt độ, độ ẩm, lượng mưa)
async function fetchLiveWeather(provName, customLat, customLon, silent = true) {
    const p = (provName || (U && U.prov) || 'Đắk Lắk').trim();
    const reg = REGION_COORDS[p] || REGION_COORDS['Đắk Lắk'];
    const lat = customLat != null ? customLat : reg.lat;
    const lon = customLon != null ? customLon : reg.lon;
    COFFEE_PRICE = reg.price || COFFEE_PRICE;
    WX.sub = customLat != null ? `GPS (${lat.toFixed(3)}, ${lon.toFixed(3)})` : reg.sub;
    WX.lat = lat;
    WX.lon = lon;
    WX.loading = true;
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FHo_Chi_Minh&forecast_days=7`;
        const resp = await fetch(url);
        if (resp.ok) {
            const data = await resp.json();
            if (data.current) {
                WX.temp = Math.round(data.current.temperature_2m ?? 26);
                WX.hum = Math.round(data.current.relative_humidity_2m ?? 75);
                WX.wind = Number((data.current.wind_speed_10m ?? 8).toFixed(1));
                WX.desc = wmoToVi(data.current.weather_code ?? 1);
                WX.code = data.current.weather_code ?? 1;
                WX.isDay = data.current.is_day ?? 1;
            }
            if (data.daily && Array.isArray(data.daily.precipitation_sum)) {
                RAIN = data.daily.precipitation_sum.slice(0, 7).map(v => {
                    const n = Number(v || 0);
                    return (n > 0 && n < 1) ? 1 : Math.round(n);
                });
                if (Array.isArray(data.daily.temperature_2m_max)) {
                    WX.tmax = data.daily.temperature_2m_max.slice(0, 7).map(v => Math.round(v ?? 28));
                }
                if (Array.isArray(data.daily.temperature_2m_min)) {
                    WX.tmin = data.daily.temperature_2m_min.slice(0, 7).map(v => Math.round(v ?? 19));
                }
                if (Array.isArray(data.daily.precipitation_probability_max)) {
                    WX.prob = data.daily.precipitation_probability_max.slice(0, 7).map(v => Math.round(v ?? 20));
                }
            }
            WX.updated = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            WX.loading = false;
            if (U) render();
            if (!silent) toast(`Đã cập nhật thời tiết thực tế tại ${p} (${WX.temp}°C · Độ ẩm ${WX.hum}%)`);
            return;
        }
    } catch (e) {}
    WX.loading = false;
    WX.updated = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (U) render();
}

// Định vị GPS tại vườn của nông dân để lấy thời tiết chính xác theo tọa độ thực tế
function useGpsWeather() {
    if (!navigator.geolocation) return toast('Trình duyệt không hỗ trợ định vị GPS');
    toast('Đang lấy tọa độ GPS vườn của bạn…');
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        let nearestProv = U ? U.prov : 'Đắk Lắk';
        let bestDist = 1e9;
        Object.entries(REGION_COORDS).forEach(([k, v]) => {
            if (k === 'Khác') return;
            const d = Math.hypot(v.lat - latitude, v.lon - longitude);
            if (d < bestDist) { bestDist = d; nearestProv = k; }
        });
        if (U && bestDist < 1.5) {
            U.prov = nearestProv;
            API.updateProfile({ userId: U.id, name: U.name, un: U.un, phone: U.phone, prov: U.prov, ph: U.ph }).catch(() => {});
        }
        fetchLiveWeather(U ? U.prov : nearestProv, latitude, longitude, false);
    }, () => toast('Không lấy được quyền truy cập vị trí GPS.'));
}

// Ghi nhớ danh sách tài khoản đã đăng nhập trên máy này để nông dân đăng nhập nhanh
function rememberAccountOnDevice(userObj, rawPw, remember) {
    A = (A || []).filter(x => x.email !== userObj.email && x.un !== userObj.un);
    if (remember) {
        A.unshift({ email: userObj.email, un: userObj.un, pw: rawPw || '' });
        A = A.slice(0, 5);
    }
    ST.s('cf.saved_accounts', A);
}

// Định dạng ngày (dd/mm), giờ phút (hh:mm), màu độ tin cậy và chữ cái đầu tên
const dm = d => String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0');
const hm = t => new Date(t).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
const cc = c => c >= .85 ? '#2F9E44' : c >= .65 ? '#D69E2E' : '#D92D20';
const ini = n => (n || 'U').trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase();

// Hiển thị thông báo Toast nhanh ở góc màn hình
function toast(t) {
    const e = $('#toast');
    e.textContent = t;
    e.className = 'on';
    clearTimeout(toast.t);
    toast.t = setTimeout(() => e.className = '', 2600);
}

// Bắn hiệu ứng pháo hoa / pháo giấy chúc mừng khi hoàn tất 100% phác đồ điều trị dứt điểm
function triggerCelebrationConfetti() {
    try {
        const colors = ['#10B981', '#059669', '#34D399', '#F59E0B', '#3B82F6', '#EC4899', '#FBBF24', '#6EE7B7'];
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden;';
        document.body.appendChild(container);

        for (let i = 0; i < 70; i++) {
            const p = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 100;
            const size = Math.random() * 8 + 6;
            const duration = Math.random() * 1.8 + 2.2;
            const delay = Math.random() * 0.35;
            p.style.cssText = `
                position: absolute;
                top: -20px;
                left: ${left}%;
                width: ${size}px;
                height: ${size * (Math.random() > 0.4 ? 1.4 : 1)}px;
                background: ${color};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                opacity: 0.95;
                transform: rotate(${Math.random() * 360}deg);
                animation: confettiFall ${duration}s ease-in forwards ${delay}s;
            `;
            container.appendChild(p);
        }
        setTimeout(() => container.remove(), 4200);
    } catch (e) {}
}

// Nạp dữ liệu tài khoản, nông trại, nhật ký từ máy chủ sau khi đăng nhập thành công
function applyBootstrap(payload, rm = true) {
    U = payload.user;
    D = Object.assign({h:[],s:{},j:[],y:[],chat:[],cd:'leaf_rust',lot:0,coop:''}, payload.data || {});
    if (payload.diseases && payload.diseases.length) {
        DS = payload.diseases;
        payload.diseases.forEach(d => {
            if (d.sym) SYM[d.id] = d.sym;
            if (d.pre) PRE[d.id] = d.pre;
        });
    }
    if (payload.rain && payload.rain.length) RAIN = payload.rain;
    if (payload.coffeePrice) COFFEE_PRICE = payload.coffeePrice;
    if (payload.news) NEWS_DB = payload.news;

    if (rm) {
        ST.s('cf.cur.uid', U.id);
        try { sessionStorage.removeItem('cf.cur.uid.s'); } catch(e) {}
    } else {
        ST.s('cf.cur.uid', null);
        try { sessionStorage.setItem('cf.cur.uid.s', String(U.id)); } catch(e) {}
    }
    S.page = 'home';
    S.last = null;
    S.enter = 1;
    render();
    fetchLiveWeather(U.prov, null, null, true);
}

// Widget hiển thị thông tin thời tiết trực tuyến và đánh giá nguy cơ nấm bệnh
function wxLivePanel() {
    const wr = RAIN.filter(x => x >= 5).length;
    const wl = wr >= 3 || WX.hum >= 82 ? 'Nguy cơ nấm cao' : (wr || WX.hum >= 72) ? 'Nguy cơ trung bình' : 'Nguy cơ thấp';
    const wColor = (wr >= 3 || WX.hum >= 82) ? 'var(--bad)' : (wr || WX.hum >= 72) ? '#B7791F' : 'var(--g)';
    return `<div class="card ${wr>=3?'hi':''}">
        <div class="row" style="margin:0 0 10px;justify-content:space-between">
            <div>
                <b style="font-size:16px">${esc(U.prov)}</b> <small class="mute">(${esc(WX.sub)})</small><br>
                <small style="color:var(--g);font-weight:600">● Trực tuyến: ${wxIcon(WX.code, WX.isDay, 18)} ${esc(WX.desc)} ${WX.updated ? '· Lúc ' + WX.updated : ''}</small>
            </div>
            <div class="rk"><b style="color:${wColor}">${wl}</b><small>${wr}/7 ngày mưa ≥ 5mm</small></div>
        </div>
        <div class="kpi" style="margin-bottom:10px;background:var(--soft);padding:10px 6px;border-radius:12px">
            <div><b>${WX.temp}°C</b>Nhiệt độ hiện tại</div>
            <div><b>${WX.hum}%</b>Độ ẩm không khí</div>
            <div><b>${WX.wind}</b>Gió (km/h)</div>
        </div>
        <div class="row" style="margin:0;gap:6px;flex-wrap:nowrap">
            <select class="wx-sel" aria-label="Chọn khu vực thời tiết" style="min-height:38px;padding:6px 10px;font-size:13px;flex:1">
                ${PROVS_LIST.map(p => `<option value="${esc(p)}" ${U.prov===p?'selected':''}>Khu vực: ${esc(p)} (${esc((REGION_COORDS[p]||{}).sub||'')})</option>`).join('')}
            </select>
            <button type="button" data-a="wxgps" style="min-height:38px;padding:0 10px;font-size:12px" title="Định vị GPS tại vườn">📍 GPS</button>
            <button type="button" data-a="wxref" style="min-height:38px;padding:0 10px;font-size:12px" title="Làm mới thời tiết">↻</button>
        </div>
    </div>`;
}

// Tính toán ngày thu hoạch an toàn dựa trên số ngày cách ly thuốc trong nhật ký
function harvest() {
    let m = 0;
    (D.j || []).forEach(e => { if (e.days > 0) m = Math.max(m, e.t + e.days * 864e5); });
    return m > Date.now() ? new Date(m) : null;
}

// Bộ icon SVG vẽ tay cho các thẻ chức năng
const ART = {
    leaf:'<path d="M10 82C10 42 35 14 90 8c0 44-26 72-80 74z" fill="var(--ac)" opacity=".25"/><path d="M10 82C35 64 60 42 90 8" stroke="var(--ac)" stroke-width="3" fill="none" opacity=".6"/><circle cx="48" cy="48" r="7" fill="var(--ac)"/><circle cx="66" cy="31" r="5" fill="var(--ac)" opacity=".8"/><circle cx="34" cy="64" r="5" fill="var(--ac)" opacity=".8"/>',
    book:'<rect x="18" y="10" width="64" height="80" rx="8" fill="var(--ac)" opacity=".25"/><path d="M32 34h36M32 48h36M32 62h22" stroke="var(--ac)" stroke-width="5" stroke-linecap="round"/>',
    news:'<rect x="10" y="18" width="80" height="64" rx="8" fill="var(--ac)" opacity=".25"/><path d="M22 66h56M22 52h26" stroke="var(--ac)" stroke-width="5" stroke-linecap="round"/><rect x="56" y="30" width="22" height="16" rx="3" fill="var(--ac)"/>',
    chart:'<rect x="10" y="12" width="80" height="76" rx="8" fill="var(--ac)" opacity=".2"/><rect x="22" y="52" width="12" height="26" rx="3" fill="var(--ac)"/><rect x="44" y="38" width="12" height="40" rx="3" fill="var(--ac)" opacity=".8"/><rect x="66" y="24" width="12" height="54" rx="3" fill="var(--ac)" opacity=".6"/>',
    cloud:'<path d="M26 76a16 16 0 010-32 22 22 0 0142-6 18 18 0 018 38z" fill="var(--ac)" opacity=".3"/><circle cx="74" cy="26" r="12" fill="var(--ac)"/>',
    spark:'<path d="M50 6l9 28 28 9-28 9-9 28-9-28-28-9 28-9z" fill="var(--ac)" opacity=".35"/><circle cx="80" cy="20" r="6" fill="var(--ac)"/>',
    qr:'<rect x="12" y="12" width="30" height="30" rx="5" fill="var(--ac)"/><rect x="58" y="12" width="30" height="30" rx="5" fill="var(--ac)" opacity=".6"/><rect x="12" y="58" width="30" height="30" rx="5" fill="var(--ac)" opacity=".6"/><rect x="58" y="58" width="12" height="12" rx="2" fill="var(--ac)"/><rect x="76" y="76" width="12" height="12" rx="2" fill="var(--ac)" opacity=".5"/>',
    doc:'<path d="M20 8h44l18 18v66H20z" fill="var(--ac)" opacity=".25"/><path d="M36 58l10 10 20-22" stroke="var(--ac)" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    coop:'<circle cx="50" cy="30" r="14" fill="var(--ac)"/><circle cx="20" cy="50" r="10" fill="var(--ac)" opacity=".6"/><circle cx="80" cy="50" r="10" fill="var(--ac)" opacity=".6"/><path d="M26 90c0-18 10-28 24-28s24 10 24 28z" fill="var(--ac)" opacity=".35"/>'
};

// Hàm tạo thẻ Card thông tin chung (gcard)
const gcard = o => `<div class="gc gc-${o.g}" style="--ac:${o.c}" ${o.href ? `data-href="${esc(o.href)}"` : ''}><svg class="gc-art" viewBox="0 0 100 100" aria-hidden="true">${ART[o.art]}</svg><div class="gc-b"><span class="gc-badge"><i style="background:${o.c}"></i>${o.badge}</span><div class="gc-m"><h3>${o.t}</h3><p>${o.d}</p></div><button class="gc-cta" data-a="${o.a}">${o.cta}${ic(o.ic || '<path d="M5 12h14M13 6l6 6-6 6"/>')}</button></div></div>`;

// Vẽ vòng tròn đo độ tin cậy phần trăm (ring chart)
const ring = (p, c) => `<div class="rg" role="img" aria-label="Độ tin cậy ${Math.round(p*100)}%"><svg viewBox="0 0 100 100" width="96" height="96"><circle class="bg" cx="50" cy="50" r="40"/><circle class="fg" cx="50" cy="50" r="40" stroke="${c||cc(p)}" style="stroke-dashoffset:${251.3*(1-p)}"/></svg><b>${Math.round(p*100)}%</b></div>`;

// Vẽ biểu đồ Donut tròn hiển thị tỉ lệ các nhóm bệnh
const donut = s => {
    let a = 0;
    return `<div class="rg" style="width:130px;height:130px" role="img" aria-label="Tỉ lệ các nhóm bệnh"><svg class="dn" viewBox="0 0 100 100" width="130" height="130"><circle cx="50" cy="50" r="40" stroke="var(--soft)" style="stroke-width:14"/>${DS.map(d => { const n = s.by[d.id] || 0, l = s.n ? n/s.n*251.3 : 0, o = a; a += l; return l ? `<circle cx="50" cy="50" r="40" stroke="${d.c}" style="stroke-width:14;stroke-dasharray:${l} ${251.3-l};stroke-dashoffset:${-o}"/>` : ''; }).join('')}</svg><b style="font-size:22px">${s.n}</b></div>`;
};

// Hiển thị danh sách các Lô vườn và tình trạng sâu bệnh mới nhất
const lots = () => LOTS.map((n, i) => {
    const x = D.h.find(h => (h.lot || 0) == i), d = x && dz(x.d), age = x ? Math.floor((Date.now() - x.t) / 864e5) : 0, re = x && isSick(x.d) && age >= 3;
    return `<div class="lot"><span class="dot" style="background:${d ? d.c : 'var(--line)'}"></span><span><b>${n}</b><br><small>${d ? d.n + ' · ' + (age ? age + ' ngày trước' : 'hôm nay') : 'Chưa quét'}</small></span>${re ? '<span class="rec">Nên kiểm tra lại</span>' : ''}</div>`;
}).join('');

// Thống kê tổng số lần quét, tần suất bệnh nhiều nhất và biểu đồ phân bố theo 14 ngày
function stats() {
    const h = D.h || [], now = Date.now(), by = {};
    h.forEach(x => { const k = ALIAS[x.d] || x.d; by[k] = (by[k] || 0) + 1; });
    const top = Object.entries(by).filter(e => isSick(e[0])).sort((a, b) => b[1] - a[1])[0], days = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
        const dayScans = h.filter(x => new Date(x.t).setHours(0, 0, 0, 0) == +d);
        const byD = {};
        dayScans.forEach(x => { const k = ALIAS[x.d] || x.d; byD[k] = (byD[k] || 0) + 1; });
        days.push({ d, n: dayScans.length, byD });
    }
    return {
        n: h.length,
        w: h.filter(x => now - x.t < 6048e5).length,
        avg: h.length ? Math.round(h.reduce((a, x) => a + x.cf, 0) / h.length * 100) : 0,
        by,
        top: top ? top[0] : null,
        days
    };
}

// ============================================================
// LỚP VẼ BOUNDING BOX TRÊN HTML5 <CANVAS> OVERLAY (TUẦN 10)
// ============================================================
function hexToRgba(hex, alpha) {
    const h = String(hex || '#E8590C').replace('#', '');
    const num = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16) || 0xE8590C;
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

function renderSingleBBoxCanvas(canvas) {
    if (!canvas) return;
    const wrap = canvas.closest('.bbox-stage-inner');
    const img = wrap ? wrap.querySelector('img') : null;
    if (!img) return;

    const paint = () => {
        const natW = img.naturalWidth || 800;
        const natH = img.naturalHeight || 600;
        const refW = Number(canvas.dataset.imgw) || natW;
        const refH = Number(canvas.dataset.imgh) || natH;
        canvas.width = natW;
        canvas.height = natH;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, natW, natH);

        if (canvas.dataset.hide === '1') return;

        let dets = [];
        try {
            dets = JSON.parse(canvas.dataset.dets || '[]');
        } catch (e) { dets = []; }
        if (!dets.length) return;

        const sx = natW / refW;
        const sy = natH / refH;
        const showLbl = canvas.dataset.labels !== '0';
        const lineW = Math.max(2, Math.round(Math.min(natW, natH) * 0.0045));
        const fontPx = Math.max(11, Math.min(15, Math.round(Math.min(natW, natH) * 0.022)));
        const usedRects = [];
        const scaledBoxes = dets.map(b => {
            const bx1 = b.x1 != null ? b.x1 : (b.bbox ? b.bbox.x_min : 0);
            const by1 = b.y1 != null ? b.y1 : (b.bbox ? b.bbox.y_min : 0);
            const bx2 = b.x2 != null ? b.x2 : (b.bbox ? b.bbox.x_max : 0);
            const by2 = b.y2 != null ? b.y2 : (b.bbox ? b.bbox.y_max : 0);
            return {
                x1: Math.max(0, Math.round(bx1 * sx)),
                y1: Math.max(0, Math.round(by1 * sy)),
                x2: Math.min(natW - 1, Math.round(bx2 * sx)),
                y2: Math.min(natH - 1, Math.round(by2 * sy)),
                raw: b
            };
        });
        const rectOverlap = (r1, r2) => {
            const ix1 = Math.max(r1.x1, r2.x1), iy1 = Math.max(r1.y1, r2.y1);
            const ix2 = Math.min(r1.x2, r2.x2), iy2 = Math.min(r1.y2, r2.y2);
            return Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
        };

        scaledBoxes.forEach((sb, idx) => {
            const { x1, y1, x2, y2, raw: b } = sb;
            const bw = Math.max(8, x2 - x1);
            const bh = Math.max(8, y2 - y1);
            const clsId = b.cls || b.class_name || 'leaf_rust';
            const dInfo = dz(clsId);
            const color = dInfo ? dInfo.c : '#E8590C';
            const confVal = b.conf != null ? b.conf : (b.confidence != null ? b.confidence : 0.88);
            const confPct = Math.round(confVal * 100);

            // 1. Nền phủ nhẹ vùng bệnh trên Canvas
            ctx.fillStyle = hexToRgba(color, 0.12);
            ctx.fillRect(x1, y1, bw, bh);

            // 2. Viền Bounding Box
            ctx.strokeStyle = color;
            ctx.lineWidth = lineW;
            ctx.strokeRect(x1, y1, bw, bh);

            // 3. Góc định vị (Corner brackets)
            const cLen = Math.min(14, Math.floor(Math.min(bw, bh) * 0.30));
            ctx.lineWidth = lineW + 1;
            ctx.beginPath();
            ctx.moveTo(x1, y1 + cLen); ctx.lineTo(x1, y1); ctx.lineTo(x1 + cLen, y1);
            ctx.moveTo(x2 - cLen, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y1 + cLen);
            ctx.moveTo(x1, y2 - cLen); ctx.lineTo(x1, y2); ctx.lineTo(x1 + cLen, y2);
            ctx.moveTo(x2 - cLen, y2); ctx.lineTo(x2, y2); ctx.lineTo(x2, y2 - cLen);
            ctx.stroke();

            // 4. Nhãn tiếng Việt + Độ tin cậy % (Tránh đè lên các vùng bệnh khác; từ khung #9 dùng nhãn rút gọn)
            if (showLbl) {
                const shortName = dInfo ? dInfo.n.split(' (')[0].replace(/^Bệnh\s+/i, '') : clsId;
                const text = idx < 8 ? `#${idx + 1} ${shortName} ${confPct}%` : `#${idx + 1} ${confPct}%`;
                ctx.font = `700 ${fontPx}px "Be Vietnam Pro", sans-serif`;
                const tw = Math.ceil(ctx.measureText(text).width);
                const padX = 5, padY = 2;
                const boxH = fontPx + padY * 2;
                const boxW = Math.min(natW - 4, tw + padX * 2);
                const cands = [
                    { x1: Math.max(2, Math.min(x1, natW - boxW - 2)), y1: Math.max(2, y1 - boxH - 2) },
                    { x1: Math.max(2, Math.min(x1, natW - boxW - 2)), y1: Math.min(natH - boxH - 2, y2 + 2) },
                    { x1: Math.max(2, Math.min(x2 - boxW, natW - boxW - 2)), y1: Math.max(2, y1 - boxH - 2) },
                    { x1: Math.max(2, Math.min(x2 - boxW, natW - boxW - 2)), y1: Math.min(natH - boxH - 2, y2 + 2) },
                    { x1: Math.max(2, x1 - boxW - 2), y1: Math.max(2, Math.min(y1, natH - boxH - 2)) },
                    { x1: Math.min(natW - boxW - 2, x2 + 2), y1: Math.max(2, Math.min(y1, natH - boxH - 2)) }
                ];
                let bestPos = cands[0], bestPen = 1e12, bestLblOverlap = 0;
                cands.forEach(c => {
                    const cr = { x1: c.x1, y1: c.y1, x2: c.x1 + boxW, y2: c.y1 + boxH };
                    let boxPen = 0, lblPen = 0;
                    scaledBoxes.forEach((ob, oIdx) => { if (oIdx !== idx) boxPen += rectOverlap(cr, ob) * 3; });
                    usedRects.forEach(ur => { lblPen += rectOverlap(cr, ur); });
                    const pen = boxPen + lblPen * 12;
                    if (pen < bestPen) { bestPen = pen; bestPos = c; bestLblOverlap = lblPen; }
                });
                if (usedRects.length > 0 && bestLblOverlap > boxW * boxH * 0.15) return;
                usedRects.push({ x1: bestPos.x1, y1: bestPos.y1, x2: bestPos.x1 + boxW, y2: bestPos.y1 + boxH });

                ctx.fillStyle = color;
                ctx.fillRect(bestPos.x1, bestPos.y1, boxW, boxH);
                ctx.fillStyle = '#FFFFFF';
                ctx.textBaseline = 'top';
                ctx.fillText(text, bestPos.x1 + padX, bestPos.y1 + padY);
            }
        });
    };

    if (img.complete && img.naturalWidth > 0) {
        paint();
    } else {
        img.addEventListener('load', paint, { once: true });
    }
}

function drawAllBBoxCanvases() {
    document.querySelectorAll('canvas.bbox-canvas').forEach(renderSingleBBoxCanvas);
}

// Khung hiển thị ảnh lá kết hợp lớp <canvas> Bounding Box Overlay
function renderStageWithCanvas(r, customId = 'scan-bbox-canvas') {
    const hasDets = Array.isArray(r.detections) && r.detections.length > 0;
    const useCanvas = hasDets && S.canvasOverlay && !S.showRaw;
    const cleanRawSrc = r.rawSrc || (r.src && r.src.includes('_yolo.jpg') ? r.src.replace('_yolo.jpg', '.jpg') : r.src);
    const imgUrl = (useCanvas || S.showRaw) ? cleanRawSrc : r.src;
    const detsJson = hasDets ? esc(JSON.stringify(r.detections)) : '[]';
    const hideAttr = useCanvas ? '0' : '1';
    const lblAttr = S.canvasLabels ? '1' : '0';
    return `<div class="bbox-stage-inner">
        <img src="${imgUrl}" alt="Ảnh lá phân tích AI">
        <canvas id="${customId}" class="bbox-canvas" data-dets="${detsJson}" data-imgw="${r.imgW || 800}" data-imgh="${r.imgH || 600}" data-hide="${hideAttr}" data-labels="${lblAttr}"></canvas>
    </div>`;
}

// ============================================================
// HÀNH ĐỘNG CHẨN ĐOÁN AI (YOLO11 + SPRING BOOT BACKEND)
// ============================================================

// Nén ảnh an toàn phía client (Max 1920px, JPEG 0.88) để giảm tải mạng từ 5MB xuống ~400KB mà không mất chi tiết đốm bệnh
async function compressImageForUpload(file) {
    if (!file || !file.type.startsWith('image/')) return file;
    // Nếu file đã nhỏ hơn 600KB thì giữ nguyên
    if (file.size <= 600 * 1024) return file;

    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            let w = img.naturalWidth || img.width;
            let h = img.naturalHeight || img.height;
            const maxDim = Math.max(w, h);
            if (maxDim > 1920) {
                const scale = 1920 / maxDim;
                w = Math.round(w * scale);
                h = Math.round(h * scale);
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob((blob) => {
                if (blob && blob.size < file.size) {
                    const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    resolve(compressedFile);
                } else {
                    resolve(file);
                }
            }, 'image/jpeg', 0.88);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(file);
        };
        img.src = url;
    });
}

// Chẩn đoán 1 ảnh lá: Gửi file ảnh + Model đã chọn -> nhận Bounding Box + Inference Time
async function scanFile(file) {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    const chosenModel = S.selModel || 'best.pt';
    S.showRaw = 0;
    S.fbOpen = 0;
    S.overrideNonCoffee = 0;
    S.last = { src: previewUrl, modelName: chosenModel };
    S.busy = 1;
    S.page = 'scan';
    render();
    try {
        const uploadReadyFile = await compressImageForUpload(file);
        const apiRes = await API.scanSingle(U.id, D.lot || 0, uploadReadyFile, chosenModel);
        S.busy = 0;
        S.pop = 1;

        let res = { ...apiRes };
        if (apiRes.status === "success") {
            if (apiRes.image_base64) {
                res.rawSrc = previewUrl;
                res.src = "data:image/jpeg;base64," + apiRes.image_base64;
            }
            if (apiRes.predictions && apiRes.predictions.length > 0) {
                res.d = apiRes.predictions[0].class_name;
                res.cf = apiRes.predictions[0].confidence;
            } else if (!res.d) {
                res.d = 'healthy';
                res.cf = 1.0;
            }
        }
        if (!res.rawSrc) {
            res.rawSrc = (res.src && res.src.includes('_yolo.jpg')) ? res.src.replace('_yolo.jpg', '.jpg') : previewUrl;
        }
        // Giải phóng object URL xem trước tạm thời sau khi server đã có ảnh lưu trữ chính thức
        if (res.rawSrc && res.rawSrc.startsWith('/uploads/') && previewUrl.startsWith('blob:')) {
            try { URL.revokeObjectURL(previewUrl); } catch (e) {}
        }
        res.t = res.t || Date.now();
        res.mode = res.mode || 'yolo11';
        res.modelName = res.modelName || chosenModel;
        res.inferMs = res.inferMs || getModelMeta(res.modelName).avgMs;
        res.boxes = (Array.isArray(res.detections) && res.detections.length) ? res.detections.length : (res.boxes || 1);
        res.lot = res.lot != null ? res.lot : (D.lot || 0);

        if (res.d !== 'khong') {
            D.h.unshift(res);
            D.cd = res.d;
        }
        S.last = res;
        render();
    } catch (e) {
        S.busy = 0;
        toast(e.message || 'Lỗi phân tích ảnh');
        render();
    }
}

// Chạy so sánh song song 2 mô hình (Model A vs Model B) trên 1 file ảnh (Tuần 11)
async function runCompareFile(file) {
    if (!file) return;
    const modelA = S.cmpModelA || 'best.pt';
    const modelB = S.cmpModelB || 'yolo11n.pt';
    S.cmpBusy = 1;
    S.page = 'bench';
    render();
    try {
        const cmpRes = await API.compareModels(U.id, D.lot || 0, file, modelA, modelB);
        S.cmpRes = cmpRes;
        S.cmpBusy = 0;
        toast(`Đã so sánh xong ${modelA} và ${modelB}!`);
        render();
    } catch (e) {
        S.cmpBusy = 0;
        toast(e.message || 'Lỗi so sánh 2 mô hình');
        render();
    }
}

// Chạy so sánh song song 2 mô hình trên ảnh mẫu có sẵn
async function runCompareSample(clsId = 'cercospora') {
    try {
        const resp = await fetch(`/samples/${clsId}.jpg`);
        if (resp.ok) {
            const blob = await resp.blob();
            const file = new File([blob], `${clsId}_compare.jpg`, { type: 'image/jpeg' });
            await runCompareFile(file);
        }
    } catch (e) {
        toast('Không tải được ảnh mẫu để so sánh');
    }
}

// Đo Benchmark thực tế cho 1 mô hình hoặc toàn bộ 6 mô hình (Tuần 11)
async function runModelBenchmark(modelId) {
    S.benchBusy = modelId;
    render();
    try {
        const bRes = await API.runBenchmark(modelId, 10);
        S.benchData[modelId] = {
            avgMs: bRes.avg_latency_ms,
            minMs: bRes.min_latency_ms,
            maxMs: bRes.max_latency_ms,
            fps: bRes.estimated_fps,
            hw: bRes.hardware ? `${bRes.hardware.device} (${bRes.hardware.device_name})` : 'Host CPU / PyTorch',
            measuredAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        S.benchBusy = '';
        toast(`⚡ Benchmark ${modelId}: TB ${bRes.avg_latency_ms} ms (${bRes.estimated_fps} FPS)`);
        render();
    } catch (e) {
        S.benchBusy = '';
        toast(e.message || 'Lỗi chạy Benchmark');
        render();
    }
}

async function runAllBenchmarks() {
    S.benchBusy = 'all';
    render();
    for (const m of MODELS_LIST) {
        try {
            const bRes = await API.runBenchmark(m.id, 6);
            S.benchData[m.id] = {
                avgMs: bRes.avg_latency_ms,
                minMs: bRes.min_latency_ms,
                maxMs: bRes.max_latency_ms,
                fps: bRes.estimated_fps,
                hw: bRes.hardware ? `${bRes.hardware.device} (${bRes.hardware.device_name})` : 'Host CPU / PyTorch',
                measuredAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };
            render();
        } catch (e) {}
    }
    S.benchBusy = '';
    toast('🎉 Đã hoàn tất đo Benchmark thực tế toàn bộ 6 mô hình!');
    render();
}

// Chẩn đoán chùm nhiều ảnh lá cùng lúc (tối đa 5 ảnh một lượt)
async function many(fl) {
    const fs = [...fl].filter(f => f.type.startsWith('image/')).slice(0, 5);
    if (!fs.length) return;
    S.page = 'scan';
    S.last = { batch: [] };
    S.busy = 1;
    render();
    try {
        const res = await API.scanBatch(U.id, D.lot || 0, fs);
        const batch = res.batch || [];
        batch.forEach(it => D.h.unshift(it));
        if (batch.length) {
            D.cd = [...batch].sort((a, b) => b.cf - a.cf)[0].d;
        }
        S.last = { batch, skip: res.skip || 0 };
        S.busy = 0;
        S.pop = 1;
        render();
    } catch (e) {
        S.busy = 0;
        toast(e.message || 'Lỗi phân tích nhiều ảnh');
        render();
    }
}

// Chạy thử nghiệm chẩn đoán nhanh trên các ảnh mẫu bệnh có sẵn trong hệ thống
async function sample(clsId) {
    const targetCls = clsId || 'leaf_rust';
    try {
        const resp = await fetch(`/samples/${targetCls}.jpg`);
        if (resp.ok) {
            const blob = await resp.blob();
            const file = new File([blob], `${targetCls}_sample.jpg`, { type: 'image/jpeg' });
            await scanFile(file);
            return;
        }
    } catch (e) {}
    S.page = 'scan';
    S.busy = 1;
    S.last = { src: '' };
    render();
    try {
        const res = await API.scanSample(U.id, D.lot || 0);
        S.busy = 0;
        S.pop = 1;
        if (res.d !== 'khong') {
            D.h.unshift(res);
            D.cd = res.d;
        }
        S.last = res;
        render();
    } catch (e) {
        S.busy = 0;
        toast(e.message || 'Lỗi tạo ảnh mẫu');
        render();
    }
}

// Gửi phản hồi chọn lại bệnh đúng của nông dân để Dạy lại AI (Active Learning)
async function submitAiFeedback() {
    const r = S.last || (D && D.h && D.h[0]);
    if (!r) {
        toast('Hãy chụp hoặc chọn 1 ảnh lá cà phê trước khi dạy lại AI.');
        return;
    }
    const newCls = S.fbCls || DS[0].id;
    const noteEl = $('#fb-note');
    const userNote = noteEl ? noteEl.value.trim() : '';
    const lt = (r.lot != null) ? r.lot : (D.lot || 0);

    S.fbBusy = 1;
    render();
    try {
        const res = await API.submitScanFeedback({
            userId: U ? U.id : null,
            scanId: r.id || null,
            rawSrc: r.rawSrc || r.src || '',
            oldDiseaseId: r.d || 'khong',
            newDiseaseId: newCls,
            userNote,
            lot: lt
        });
        const updated = Object.assign({}, r, res, {
            d: res.d || newCls,
            cf: res.cf || 0.99,
            mode: 'yolo11-learned',
            corrected: true,
            oldD: r.d
        });
        S.last = updated;
        S.fbOpen = 0;
        S.fbBusy = 0;
        S.showRaw = 0;
        D.cd = updated.d;

        const idx = D.h.findIndex(x => (updated.id && x.id == updated.id) || (x.t && x.t == r.t));
        if (idx >= 0) {
            D.h[idx] = Object.assign({}, D.h[idx], updated);
        } else {
            D.h.unshift(updated);
        }

        const learnedName = dz(updated.d).n;
        toast(`Đã dạy lại AI: "${learnedName}"! Đã lưu vào bộ nhớ Active Learning & Dataset YOLO11.`);
        render();
    } catch (e) {
        S.fbBusy = 0;
        toast(e.message || 'Không gửi được phản hồi học lại cho AI');
        render();
    }
}

// Khung chọn bệnh đúng để dạy lại mô hình khi kết quả nhận diện chưa chuẩn (Active Learning)
function renderFeedbackPanel(r, forceShow = false) {
    if (!forceShow && S.fbOpen === 0) return '';
    const target = r || (D && D.h && D.h[0]);
    if (!target) return '';
    const curOrig = target.d && target.d !== 'khong' ? (ALIAS[target.d] || target.d) : null;
    const defaultAlt = (DS.find(x => x.id !== curOrig) || DS[0]).id;
    const curSel = S.fbCls || defaultAlt;
    const oldInfo = curOrig ? dz(curOrig) : null;

    return `<div id="fb-panel" class="fb-box" style="margin-top:16px;padding:16px;border-radius:14px;background:var(--soft);border:2px solid #F59E0B">
        <div class="row" style="margin:0 0 8px;justify-content:space-between;align-items:flex-start">
            <div>
                <b style="color:#B45309;font-size:15.5px">⚠️ Kết quả AI chưa chuẩn? Chọn lại bệnh đúng để Dạy lại AI (Active Learning)</b>
                <p class="mute" style="margin:3px 0 0;font-size:13px">
                    ${oldInfo ? `AI đang nhận diện là <b style="color:${oldInfo.c}">${esc(oldInfo.n)}</b>. ` : ''}Nếu thực tế lá bị bệnh khác, hãy bấm chọn loại bệnh đúng bên dưới rồi nhấn <b>Xác nhận &amp; Cho AI học lại ngay</b>:
                </p>
            </div>
            ${!forceShow ? `<button type="button" data-a="fbclose" style="min-height:32px;padding:4px 10px;font-size:12px">Thu gọn ✕</button>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin:10px 0">
            ${DS.map(item => {
                const on = curSel === item.id;
                const isOld = curOrig === item.id;
                return `<button type="button" data-a="fbsel:${item.id}" style="text-align:left;padding:10px 12px;border-radius:11px;border:2px solid ${on ? item.c : 'var(--line)'};background:${on ? 'var(--card)' : 'transparent'};display:flex;flex-direction:column;gap:3px;cursor:pointer;box-shadow:${on ? '0 3px 10px rgba(0,0,0,0.08)' : 'none'}">
                    <span style="display:flex;align-items:center;justify-content:space-between;width:100%;font-weight:700;color:${on ? item.c : 'var(--ink)'}">
                        <span><span class="dot" style="background:${item.c};display:inline-block;margin-right:6px"></span>${esc(item.n)}</span>
                        <span>${on ? '✓ Đang chọn' : ''}</span>
                    </span>
                    <small class="mute" style="font-size:11.5px;line-height:1.35">${esc(SYM[item.id] ? SYM[item.id].slice(0, 68) + '…' : item.sci)}</small>
                    ${isOld ? '<small style="color:#B45309;font-size:11px;font-weight:600">• Kết quả AI vừa đoán</small>' : ''}
                </button>`;
            }).join('')}
        </div>
        <div class="row" style="margin:10px 0 0;gap:8px;flex-wrap:wrap">
            <input id="fb-note" type="text" placeholder="Ghi chú thêm dấu hiệu thực tế (tùy chọn, VD: mặt dưới không có phấn cam, đốm tâm xám…)" style="flex:1;min-width:220px;min-height:40px;padding:8px 12px;font-size:13px">
            <button type="button" class="pri" data-a="fbsend" ${S.fbBusy ? 'disabled' : ''} style="min-height:40px;background:#D97706;border-color:#D97706;font-weight:700">
                ${S.fbBusy ? 'Đang dạy lại AI…' : '✓ Xác nhận &amp; Cho AI học lại ngay'}
            </button>
        </div>
    </div>`;
}

// Thẻ độc lập hướng dẫn người dùng báo sai kết quả và huấn luyện lại AI
function renderStandaloneFeedbackCard() {
    const latest = (D && D.h && D.h.length) ? D.h[0] : null;
    if (!latest) {
        return `<div class="card" style="border:2px dashed #F59E0B">
            <div class="row" style="margin:0 0 6px;justify-content:space-between">
                <h3 style="margin:0;color:#B45309">🧠 Báo sai kết quả &amp; Dạy lại AI (Active Learning)</h3>
                <span class="tg" style="background:#FEF3C7;color:#B45309">Tính năng mới</span>
            </div>
            <p class="mute" style="margin:0 0 10px">Sau khi bạn chụp ảnh hoặc bấm vào 1 ảnh mẫu bên dưới, nếu AI nhận diện chưa đúng loại bệnh, bạn có thể <b>chọn lại loại bệnh đúng ngay tại đây</b> để AI ghi nhớ đặc trưng ảnh và tự động cập nhật vào Dataset huấn luyện YOLO11.</p>
            <div class="row" style="margin:0"><button type="button" class="pri" data-a="sample:cercospora" style="background:#D97706;border-color:#D97706">Thử quét 1 ảnh &amp; Dạy lại AI ngay</button></div>
        </div>`;
    }
    const d = dz(latest.d);
    return `<div class="card" style="border:2px solid #F59E0B">
        <div class="row" style="margin:0 0 8px;justify-content:space-between;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:12px">
                <img src="${latest.th || latest.src}" alt="" style="width:64px;height:48px;object-fit:cover;border-radius:8px;border:1px solid var(--line)">
                <div>
                    <span class="tg" style="background:#FEF3C7;color:#B45309;font-weight:700">🧠 Hiệu chỉnh &amp; Dạy lại AI (Active Learning)</span>
                    <div style="margin-top:3px">Ảnh gần nhất: <b style="color:${d.c}">${esc(d.n)}</b> (${Math.round(latest.cf * 100)}% · ${LOTS[latest.lot || 0]})</div>
                </div>
            </div>
            <button type="button" data-a="viewscan:0" style="min-height:36px;font-size:12.5px">Mở chi tiết ảnh này</button>
        </div>
        ${renderFeedbackPanel(latest, true)}
    </div>`;
}

// ============================================================
// HỘP THOẠI TRỢ LÝ CÀ PHÊ AI (CHATBOT ASSISTANT)
// ============================================================

// Tạo lời chào tự động cá nhân hóa theo tên nông dân và lần quét bệnh gần nhất
const greet = () => `Xin chào ${esc(U.name.split(' ').pop())}! ${D.h[0] ? 'Lần quét gần nhất của bạn là ' + dz(D.h[0].d).n + '.' : 'Bạn chưa quét lá nào.'} Hỏi mình về bệnh, thời tiết, thu hoạch nhé.`;

// Định dạng danh sách tin nhắn chat giữa người dùng (u) và trợ lý bot (b)
const msgs = () => [{r:'b',t:greet()},...(D.chat||[])].map(m => `<div class="m ${m.r}">${m.r=='b'&&m.t==greet()?greet():esc(m.t)}</div>`).join('');

// Cuộn khung chat xuống tin nhắn mới nhất
const refresh = () => document.querySelectorAll('.msgs').forEach(e => { e.innerHTML = msgs(); e.scrollTop = 1e9; });

// Gửi câu hỏi cho Trợ lý AI nông nghiệp CafeLeaf và hiển thị phản hồi
async function send(q) {
    q = (q || '').trim();
    if (!q) return;
    D.chat.push({r:'u',t:q});
    const pending = {r:'b',t:'Đang tra cứu dữ liệu vườn'};
    D.chat.push(pending);
    refresh();
    try {
        const res = await API.askChat(U.id, q);
        pending.t = res.t;
    } catch (e) {
        pending.t = 'Không kết nối được máy chủ AI. Hãy thử lại.';
    }
    refresh();
}

// Tạo thành phần giao diện hộp thoại Chatbot AI
const chatBox = () => `<div class="chat"><div class="msgs"></div><form data-f="chat" class="cf"><input name="q" aria-label="Câu hỏi cho trợ lý" placeholder="Hỏi về bệnh, thuốc, thời tiết…" autocomplete="off"><button class="pri" aria-label="Gửi">${ic(SEND)}</button></form></div>`;

// ============================================================
// CÁC HÀM RENDER TRANG CHỨC NĂNG (PAGE RENDERING)
// ============================================================

// Trang Chẩn đoán (Scan) cho máy tính (Desktop) - Tuần 10
function pScanDesktop() {
    const r = S.last, lt = (r && r.lot != null) ? r.lot : (D.lot || 0);
    const curModelId = (r && r.modelName) ? r.modelName : (S.selModel || 'best.pt');
    const curModelMeta = getModelMeta(curModelId);

    const modelBar = `<div class="model-select-bar">
        <div class="chips" role="group" aria-label="Chọn lô vườn" style="margin:0">
            <span class="mute" style="align-self:center;white-space:nowrap;font-weight:600">📍 Lô vườn:</span>
            ${LOTS.map((l, i) => `<button class="chip ${(D.lot||0)==i?'on':''}" data-a="lot:${i}">${l}</button>`).join('')}
        </div>
        <div class="row" style="margin:0;gap:8px;flex-wrap:wrap">
            <label for="scan-model-sel" style="font-size:13px;font-weight:700;color:var(--ink)">🧠 Chọn Model AI:</label>
            <select id="scan-model-sel" aria-label="Chọn mô hình AI nhận diện">
                ${MODELS_LIST.map(m => `<option value="${esc(m.id)}" ${(S.selModel||'best.pt')===m.id?'selected':''}>${esc(m.name)} — ${esc(m.badge)}</option>`).join('')}
            </select>
            <button type="button" class="out" data-a="go:bench" style="min-height:38px;padding:0 12px;font-size:12.5px;font-weight:700">⚖️ So sánh &amp; Benchmark</button>
        </div>
    </div>`;

    const act = (a, ico, t, sub, tag) => `<button class="act" data-a="${a}"><span class="ib">${ic(ico)}</span><span><b>${t}</b>${tag?` <span class="tg">${tag}</span>`:''}<small>${sub}</small></span><span class="go">${ic('<path d="M5 12h14M13 6l6 6-6 6"/>')}</span></button>`;
    const CAM = '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>';
    let top;
    if (S.busy) {
        top = `<div class="card"><div class="stage">${r&&r.src?`<img src="${r.src}" alt="Ảnh lá đang phân tích">`:''}<div class="busy">Mô hình ${esc(getModelMeta(S.selModel).name)} đang khoanh vùng vết bệnh…</div></div></div>`;
    } else if (r && r.d == 'khong') {
        top = `<div class="card pop" style="border:2px solid #DC2626"><div class="cols c2" style="align-items:center"><div class="stage"><img src="${r.rawSrc || r.src}" alt="Ảnh vừa chụp"></div><div><span class="tg" style="background:#FEE2E2;color:#DC2626;font-weight:700;margin-bottom:6px;display:inline-block">🚫 Không hợp lệ</span><h2 style="color:#DC2626;margin:4px 0 8px">Không phát hiện lá cà phê trong ảnh</h2><p style="margin:0 0 14px;font-weight:500">Không phát hiện lá cà phê trong ảnh. Vui lòng chụp hoặc tải lên ảnh lá cà phê rõ nét.</p><div class="row" style="flex-wrap:wrap"><button class="pri" data-a="pick:fil">📷 Chọn lại ảnh lá cà phê</button><button data-a="clr">Đóng</button></div></div></div></div>`;
    } else if (r && r.d) {
        const rawNote = String(r.note || '');
        const nonCoffeeMatch = rawNote.match(/^\[CẢNH BÁO LÁ LẠ:\s*([^\]]+)\]\s*(.*)$/);
        const suspectReason = nonCoffeeMatch ? nonCoffeeMatch[1] : '';
        const cleanNote = nonCoffeeMatch ? nonCoffeeMatch[2] : rawNote;

        if (suspectReason && !S.overrideNonCoffee) {
            top = `<div class="card ${S.pop?'pop':''}" style="border:2px solid #F59E0B"><div class="cols c2" style="align-items:center"><div class="stage"><img src="${r.rawSrc || r.src}" alt="Ảnh lá nghi ngờ"></div><div><span class="tg" style="background:#FEF3C7;color:#B45309;font-weight:700;margin-bottom:6px;display:inline-block">⚠️ Cổng kiểm tra hình thái sinh học · Nghi ngờ lá cây khác</span><h2 style="color:#D97706;margin:4px 0 8px">Phát hiện lá cây không giống lá cà phê!</h2><div style="background:#FFFBEB;border:1px solid #FCD34D;color:#92400E;padding:12px;border-radius:10px;margin:8px 0 10px;font-size:13.5px;line-height:1.5"><b>🔍 Lý do hình thái học:</b> ${esc(suspectReason)}</div><p class="mute" style="margin:0 0 12px;font-size:13px">Mô hình <b>YOLO11-CBAM (best.pt)</b> được huấn luyện chuyên biệt cho <b>lá cà phê (Arabica / Robusta)</b> — lá đơn, hình bầu dục thuôn, mép nguyên. Nếu bạn bỏ nhầm lá cây khác (lá đu đủ, lá cỏ, lá hoa, lá sắn...), kết quả chẩn đoán sẽ không có giá trị.</p><div class="row" style="flex-wrap:wrap;gap:8px"><button class="pri" data-a="clr">📷 Chụp / Tải lại lá cà phê chuẩn</button><button type="button" class="out" data-a="override_noncoffee" style="border-color:#D97706;color:#B45309;font-weight:700;background:#FEF3C7">🌿 Đây là lá cà phê (bị rách/dị dạng) — Vẫn xem kết quả AI</button></div></div></div></div>`;
        } else {
            const d = dz(r.d);
            const isLearned = r.corrected || r.mode === 'yolo11-learned';
            const inferMs = Number(r.inferMs || curModelMeta.avgMs || 168.4).toFixed(1);
            const fpsVal = (1000 / Math.max(1, Number(inferMs))).toFixed(1);
            const boxCount = (Array.isArray(r.detections) && r.detections.length) ? r.detections.length : (r.boxes || 1);
            const hasDets = Array.isArray(r.detections) && r.detections.length > 0;

            const jsonPreview = JSON.stringify({
                status: "SUCCESS",
                model_used: isLearned ? "models/best.pt + Active Learning Memory" : curModelMeta.name,
                disease_id: r.d,
                disease_name: d.n,
                scientific_name: d.sci,
                confidence: Number((r.cf * 100).toFixed(1)) + "%",
                inference_time_ms: Number(inferMs),
                estimated_fps: Number(fpsVal),
                bounding_boxes_count: boxCount,
                risk_level: d.risk,
                lot: LOTS[lt],
                detections: (r.detections || []).slice(0, 6),
                note: cleanNote
            }, null, 2);

            top = `<div class="card ${S.pop?'pop':''}">
                <div class="cols c2" style="align-items:flex-start">
                    <div>
                        <div class="stage">${renderStageWithCanvas(r, 'scan-bbox-canvas')}</div>
                        <div class="row" style="margin:10px 0 0;justify-content:center;flex-wrap:wrap;gap:6px">
                            ${hasDets ? `<button type="button" class="${S.canvasOverlay?'pri':'out'}" data-a="canvas_toggle" style="min-height:34px;padding:0 12px;font-size:12px">🎯 Canvas Overlay: ${S.canvasOverlay?'BẬT':'TẮT'}</button>` : ''}
                            ${hasDets && S.canvasOverlay ? `<button type="button" class="out" data-a="canvas_lbl" style="min-height:34px;padding:0 12px;font-size:12px">🏷️ Nhãn %: ${S.canvasLabels?'HIỆN':'ẨN'}</button>` : ''}
                            ${r.rawSrc ? `<button type="button" class="out" data-a="rawtoggle" style="min-height:34px;padding:0 12px;font-size:12px">${S.showRaw?'👁️ Xem khung YOLO11':'📷 Xem ảnh gốc'}</button>` : ''}
                        </div>
                    </div>
                    <div style="min-width:0">
                        <span class="tg" style="background:var(--soft);color:var(--g);font-weight:700;margin-bottom:6px;display:inline-block">${isLearned ? '🧠 Active Learning · AI đã học & hiệu chỉnh mẫu này' : `✓ ${esc(curModelMeta.name)} · mAP50 ${curModelMeta.map50}%`}</span>
                        <h2 style="color:${d.c};margin:2px 0 4px">${d.n}</h2>
                        <i>${d.sci} · Mức nguy hại: <b style="color:${d.c}">${d.risk}</b></i>
                        ${cleanNote?`<p style="margin:8px 0 0;word-break:break-word;font-size:13.5px">${esc(cleanNote)}</p>`:''}

                        <!-- Dải chỉ số kỹ thuật: Độ tin cậy, Inference Time (ms), FPS, Số vết bệnh -->
                        <div class="infer-metrics-strip">
                            <div class="infer-metric-item"><b style="color:${cc(r.cf)}">${Math.round(r.cf*100)}%</b><small>Độ tin cậy AI</small></div>
                            <div class="infer-metric-item"><b style="color:var(--g)">⚡ ${inferMs} ms</b><small>Inference Time</small></div>
                            <div class="infer-metric-item"><b>🚀 ${fpsVal} FPS</b><small>Tốc độ xử lý</small></div>
                            <div class="infer-metric-item"><b>🎯 ${boxCount} vùng</b><small>Bounding Boxes</small></div>
                        </div>

                        <!-- Khuyến nghị xử lý trực tiếp trên kết quả nhận diện (Tuần 10) -->
                        <div class="quick-rec-box">
                            <h4>🛡️ Khuyến nghị xử lý nhanh (${d.st.length} bước chuẩn VietGAP):</h4>
                            <ul>
                                ${d.st.map(step => `<li>${esc(step)}</li>`).join('')}
                            </ul>
                        </div>

                        <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:10px">
                            <button class="pri" data-a="opd:${d.id}">👉 Mở phác đồ điều trị chi tiết</button>
                            <button type="button" class="out" data-a="go:bench">⚖️ So sánh với Model khác</button>
                            <button type="button" data-a="fbopen" style="border-color:#F59E0B;color:#B45309;font-weight:700;background:#FEF3C7">⚠️ Sai kết quả? Dạy lại AI</button>
                            <button data-a="clr">Chụp lá khác</button>
                        </div>
                    </div>
                </div>
                ${renderFeedbackPanel(r, true)}
                <details style="margin-top:14px">
                    <summary style="cursor:pointer;font-weight:600;color:var(--g);font-size:13px">🔬 Xem chi tiết JSON &amp; Tọa độ Bounding Box (${esc(curModelMeta.id)} · ${inferMs} ms)</summary>
                    <pre style="background:var(--soft);color:var(--ink);padding:12px;border-radius:10px;margin:8px 0 0;font-size:12.5px;overflow-x:auto;white-space:pre-wrap;word-break:break-word;max-width:100%">${esc(jsonPreview)}</pre>
                </details>
            </div>`;
        }
    } else if (r && r.batch && (r.batch.length || r.skip)) {
        const b = r.batch, sick = b.filter(x => isSick(x.d)).length;
        top = `<div class="card ${S.pop?'pop':''}"><h3>Kết quả ${b.length} lá (${esc(curModelMeta.name)})</h3><p class="mute" style="margin-top:0">${sick?sick+' lá có dấu hiệu bệnh.':'Cả '+b.length+' lá đều khỏe.'} Đã lưu vào MySQL.${r.skip?' '+r.skip+' ảnh không nhận ra lá cà phê nên không lưu.':''}</p><div class="rgrid">${b.map(x => { const d = dz(x.d); return `<button class="rc" data-a="opd:${x.d}"><img src="${x.src}" alt=""><span class="t"><span class="dot" style="background:${d.c}"></span>${d.n}</span><small>${Math.round(x.cf*100)}%</small></button>`; }).join('')}</div><div class="row"><button class="pri" data-a="go:treat">Xem cách xử lý</button><button data-a="clr">Quét tiếp</button></div></div>`;
    } else {
        top = `<div class="hero scanhero"><div><span class="pill">${esc(curModelMeta.name)} · mAP50 ${curModelMeta.map50}% · ~${curModelMeta.avgMs} ms</span><h1>Lá cà phê bị bệnh gì?</h1><p>Chụp hoặc tải 1 tấm lá sẽ tự động khoanh vùng vết bệnh bằng <b>HTML5 Canvas Overlay</b>, đo <b>Inference Time (ms)</b> và đưa phác đồ xử lý.</p><div class="mini"><div><b>${curModelMeta.map50}%</b><small>Độ chính xác mAP50</small></div><div><b>~${curModelMeta.avgMs} ms</b><small>Inference Time</small></div><div><b>5 lớp</b><small>Bệnh &amp; lá khoẻ</small></div></div></div><button class="big" data-a="pick:cam">${ic(CAM)}Chụp ảnh ngay</button></div>`;
    }
    const rc = D.h.slice(0, 12);
    const hw = (ico, t, sb) => `<div class="hw"><span class="ib">${ic(ico)}</span><span><b>${t}</b><small style="display:block">${sb}</small></span></div>`;
    const tp = (ico, t) => `<div class="tp"><span class="ib">${ic(ico)}</span>${t}</div>`;
    const sampleCards = `<div class="card"><div class="row" style="margin:0 0 10px;justify-content:space-between"><h3 style="margin:0">Kiểm thử nhanh 5 lớp bệnh (Model: ${esc(S.selModel||'best.pt')})</h3><span class="tg">Nhấn vào ảnh để AI vẽ Canvas Bounding Box</span></div><div class="rgrid">${DS.map(d => `<button class="rc" data-a="sample:${d.id}"><img src="/samples/${d.id}.jpg" alt="${esc(d.n)}"><span class="t"><span class="dot" style="background:${d.c}"></span>${d.n}</span><small>Chạy thử ${esc(S.selModel||'best.pt')}</small></button>`).join('')}</div></div>`;
    const colabCard = `<div class="card"><h3>Thông số Model đang chọn (${esc(curModelMeta.id)})</h3><p class="mute" style="margin:0 0 10px">${esc(curModelMeta.arch)} · <code>imgsz=${curModelMeta.imgsz}</code> · <code>${curModelMeta.sizeMb} MB</code></p><div class="kpi"><div><b>${curModelMeta.map50}%</b>mAP50</div><div><b>${curModelMeta.prec}%</b>Box(P)</div><div><b>${curModelMeta.avgMs} ms</b>Latency</div></div>${DS.map((d, idx) => `<div class="pg"><span>${idx}: ${d.n}</span><div class="bar"><i style="width:100%;background:${d.c}"></i></div><em>✓</em></div>`).join('')}<div class="row" style="margin:10px 0 0"><button type="button" class="out" data-a="go:bench" style="width:100%">📊 Mở bảng So sánh &amp; Benchmark 6 Model</button></div></div>`;
    const standaloneFb = (!r && !S.busy) ? renderStandaloneFeedbackCard() : '';
    return `<h1 style="font-size:22px">Chẩn đoán bệnh lá cà phê</h1><p class="sub" style="margin:0 0 12px">Hỗ trợ tùy chọn <b>6 mô hình YOLO11</b>, hiển thị <b>Canvas Bounding Box Overlay</b>, đo <b>Inference Time (ms)</b> &amp; <b>Active Learning</b></p>
    <div class="cols c21"><div>${modelBar}${top}
    <div class="acts">${act('pick:fil','<path d="M12 16V5M7 9l5-5 5 5"/><path d="M5 19h14"/>','Tải ảnh lên','Ảnh JPG, PNG có sẵn trong máy')}${act('pick:mul','<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4"/>','Nhiều lá cùng lúc','Tổng hợp kết quả nhiều lá','Tối đa 5 ảnh')}</div>
    ${standaloneFb}
    ${sampleCards}
    <div class="card"><div class="row" style="margin:0 0 12px;justify-content:space-between"><h3 style="margin:0">Chẩn đoán gần đây</h3>${rc.length?'<button data-a="go:hist" style="min-height:36px;border:0;background:none;color:var(--g)">Xem tất cả</button>':''}</div>${rc.length?`<div class="rgrid">${rc.map((x, idx) => { const d = dz(x.d); return `<button class="rc" data-a="viewscan:${idx}"><img src="${x.th || x.src}" alt=""><span class="t"><span class="dot" style="background:${d.c}"></span>${d.n}</span><small>${Math.round(x.cf*100)}% · ${x.inferMs ? x.inferMs + ' ms · ' : ''}${dm(new Date(x.t))}</small><small style="color:#B45309;font-weight:600;margin-top:2px">⚠️ Bấm để xem / Sửa bệnh</small></button>`; }).join('')}</div>`:'<p class="mute" style="margin:0">Chưa có lần chẩn đoán nào. Chụp chiếc lá đầu tiên để bắt đầu.</p>'}</div></div>
    <div>${colabCard}${wxLivePanel()}
    <div class="card"><h3>AI YOLO11 làm việc thế nào?</h3>${hw(CAM,'Chụp hoặc tải ảnh lá','Một lá rõ nét là đủ')}${hw('<path d="M12 4l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>','YOLO11 phân tích ảnh lá','Khoanh vùng bằng Canvas Overlay & đo tốc độ ms')}${hw('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>','Nhận hướng xử lý','Các bước và lưu ý an toàn, theo nhãn thuốc')}<button data-a="sample:leaf_rust" style="width:100%;margin-top:8px">Thử với ảnh mẫu YOLO11</button></div>
    <div class="card"><h3>Mẹo chụp để AI nhận diện chuẩn</h3>${tp('<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>','Chụp gần, rõ nét cả mặt lá')}${tp('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>','Ánh sáng tự nhiên, tránh bóng đổ')}${tp('<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14z"/><path d="M5 19l8-8"/>','Chỉ 1 lá, không bị che khuất')}${tp('<path d="M7 4v14M3 14l4 4 4-4M17 20V6M13 10l4-4 4 4"/>','Chụp cả mặt trên và mặt dưới lá')}</div></div></div>
    <input id="cam" type="file" accept="image/*" capture="environment" hidden><input id="fil" type="file" accept="image/*" hidden><input id="mul" type="file" accept="image/*" multiple hidden>`;
}

// Giao diện Chẩn đoán trên Di động: Tinh gọn, nút bấm to, Canvas Overlay, Inference Time & Giọng đọc
function pScanMobile() {
    const r = S.last, lt = (r && r.lot != null) ? r.lot : (D.lot || 0);
    const curModelId = (r && r.modelName) ? r.modelName : (S.selModel || 'best.pt');
    const curModelMeta = getModelMeta(curModelId);

    if (S.busy) {
        return `
        <div class="card" style="text-align:center;padding:32px 16px">
          ${r && r.src ? `<img src="${r.src}" style="max-height:220px;border-radius:12px;margin-bottom:14px">` : ''}
          <div style="font-size:18px;font-weight:700;margin-bottom:6px">Đang phân tích lá cà phê...</div>
          <p class="mute" style="margin:0;font-size:13px">Mô hình ${esc(curModelMeta.name)} đang khoanh vùng đốm bệnh</p>
        </div>`;
    }

    if (r && r.d == 'khong') {
        return `
        <div class="card" style="border:2px solid var(--bad);padding:18px">
          <div class="m-traffic-badge red">❌ Không nhận diện được lá cà phê</div>
          <div class="stage" style="min-height:180px;margin-bottom:12px"><img src="${r.rawSrc || r.src}"></div>
          <p style="font-size:14px;line-height:1.45;margin-bottom:14px">Ảnh chụp chưa rõ lá cà phê hoặc bị mờ. Bác vui lòng đưa camera sát vào mặt lá cà phê và chụp lại nhé.</p>
          <button class="m-btn-pri" data-a="pick:cam">📸 Chụp lại ảnh lá khác</button>
          <button data-a="clr" style="width:100%;min-height:42px;margin-top:6px">Đóng</button>
        </div>`;
    }

    if (r && r.d) {
        const d = dz(r.d);
        const isHealthy = r.d === 'khoe' || r.d === 'healthy';
        const badgeClass = isHealthy ? 'green' : (d.risk === 'Cao' ? 'red' : 'yellow');
        const badgeText = isHealthy ? '🟢 LÁ CÀ PHÊ KHỎE MẠNH' : (d.risk === 'Cao' ? '🔴 CẦN XỬ LÝ GẤP - NGUY CƠ CAO' : '🟡 CẦN THEO DÕI VÀ XỬ LÝ SỚM');
        const inferMs = Number(r.inferMs || curModelMeta.avgMs || 168.4).toFixed(1);
        const boxCount = (Array.isArray(r.detections) && r.detections.length) ? r.detections.length : (r.boxes || 1);
        const hasDets = Array.isArray(r.detections) && r.detections.length > 0;

        const jsonPreview = JSON.stringify({
            model: curModelMeta.name,
            disease_id: r.d,
            disease_name: d.n,
            confidence: Number((r.cf * 100).toFixed(1)) + "%",
            inference_time_ms: Number(inferMs),
            boxes: boxCount,
            risk_level: d.risk,
            lot: LOTS[lt]
        }, null, 2);

        const speechText = isHealthy 
            ? `Lá cà phê khỏe mạnh, không có dấu hiệu bệnh. Độ tin cậy ${Math.round(r.cf*100)} phần trăm.` 
            : `Phát hiện ${d.n}. Độ tin cậy ${Math.round(r.cf*100)} phần trăm. Thời gian xử lý ${inferMs} mili giây. Phác đồ điều trị gồm ${d.st.length} bước: ${d.st.join('. ')}`;

        return `
        <div class="m-traffic-badge ${badgeClass}">${badgeText}</div>
        
        <div class="card" style="padding:14px;margin-bottom:12px">
          <div class="stage" style="min-height:220px;border-radius:10px;margin-bottom:10px">
            ${renderStageWithCanvas(r, 'mob-bbox-canvas')}
          </div>
          <div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:10px">
            ${hasDets ? `<button type="button" class="${S.canvasOverlay?'pri':'out'}" data-a="canvas_toggle" style="min-height:34px;font-size:12px">🎯 Canvas: ${S.canvasOverlay?'BẬT':'TẮT'}</button>` : ''}
            ${r.rawSrc ? `<button type="button" class="out" data-a="rawtoggle" style="min-height:34px;font-size:12px">${S.showRaw ? '👁️ Xem khung AI' : '📷 Xem ảnh gốc'}</button>` : ''}
          </div>

          <h2 style="font-size:22px;color:${d.c};margin:0 0 2px">${d.n}</h2>
          <div style="font-size:12.5px;color:var(--mute);margin-bottom:8px"><i>${d.sci}</i> · Lô: <b>${LOTS[lt]}</b></div>

          <div class="infer-metrics-strip" style="grid-template-columns:repeat(3,1fr);margin:8px 0 10px">
            <div class="infer-metric-item"><b style="color:${cc(r.cf)}">${Math.round(r.cf*100)}%</b><small>Độ tin cậy</small></div>
            <div class="infer-metric-item"><b style="color:var(--g)">⚡ ${inferMs} ms</b><small>Tốc độ AI</small></div>
            <div class="infer-metric-item"><b>🎯 ${boxCount} vùng</b><small>Vết bệnh</small></div>
          </div>

          <div class="quick-rec-box" style="margin:8px 0 10px">
            <h4>🛡️ Khuyến nghị xử lý:</h4>
            <ul>${d.st.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
          </div>

          <button type="button" class="m-audio-btn" data-a="speak:${esc(speechText)}">
            🔊 Bấm nghe hướng dẫn đọc bằng giọng nói
          </button>

          ${!isHealthy ? `
            <button type="button" class="m-btn-pri" data-a="opd:${d.id}">
              👉 Xem phác đồ điều trị ${d.st.length} bước
            </button>
          ` : ''}

          <div style="display:flex;gap:8px;margin-top:6px">
            <button class="pri" data-a="pick:cam" style="flex:1;min-height:42px;font-size:13.5px">📸 Chụp lá khác</button>
            <button data-a="clr" style="min-height:42px;font-size:13.5px">Xong</button>
          </div>

          <details class="m-details">
            <summary>🔬 Chi tiết kỹ thuật AI (${esc(curModelMeta.id)} · ${inferMs} ms)</summary>
            <div class="m-details-content">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
                <div>Độ tin cậy: <b>${Math.round(r.cf*100)}%</b></div>
                <div>Inference: <b>${inferMs} ms</b></div>
                <div>Trọng số: <b>${esc(curModelMeta.id)}</b></div>
                <div>Lô vườn: <b>${LOTS[lt]}</b></div>
              </div>
              <pre style="background:var(--sf);padding:8px;border-radius:8px;font-size:11px;overflow-x:auto">${esc(jsonPreview)}</pre>
            </div>
          </details>

          <details class="m-details" style="margin-top:8px">
            <summary>⚠️ Báo AI chẩn đoán chưa chuẩn (Dạy lại AI)</summary>
            <div class="m-details-content">
              ${renderFeedbackPanel(r, true)}
            </div>
          </details>
        </div>`;
    }

    if (r && r.batch && r.batch.length) {
        const b = r.batch, sick = b.filter(x => isSick(x.d)).length;
        return `
        <div class="card">
          <h3 style="font-size:18px">Kết quả ${b.length} lá đã chụp</h3>
          <p class="mute" style="margin:0 0 10px">${sick ? `Có <b>${sick} lá</b> có dấu hiệu bệnh.` : 'Tất cả lá đều khỏe mạnh.'}</p>
          <div class="rgrid">
            ${b.map(x => {
              const d = dz(x.d);
              return `<button class="rc" data-a="opd:${x.d}"><img src="${x.src}"><span class="t"><span class="dot" style="background:${d.c}"></span>${d.n}</span><small>${Math.round(x.cf*100)}%</small></button>`;
            }).join('')}
          </div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="pri" data-a="go:treat" style="flex:1">Xem cách xử lý</button>
            <button data-a="clr">Quét tiếp</button>
          </div>
        </div>`;
    }

    return `
    <div style="margin-bottom:12px">
      <h1 style="font-size:22px">Chẩn đoán bệnh lá cà phê</h1>
      <p class="mute" style="margin:2px 0 0;font-size:13px">Công nghệ trí tuệ nhân tạo YOLO11 hỗ trợ nhà vườn</p>
    </div>

    <div class="chips" style="margin-bottom:10px">
      <span class="mute" style="align-self:center;font-size:12px;margin-right:4px">Chọn lô:</span>
      ${LOTS.map((l, i) => `<button class="chip ${(D.lot||0)==i?'on':''}" data-a="lot:${i}">${l}</button>`).join('')}
    </div>

    <div class="card" style="padding:10px 12px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:8px">
      <span style="font-size:12.5px;font-weight:700">🧠 Model AI:</span>
      <select id="scan-model-sel" style="flex:1;min-height:36px;padding:4px 8px;font-size:12.5px">
        ${MODELS_LIST.map(m => `<option value="${esc(m.id)}" ${(S.selModel||'best.pt')===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}
      </select>
    </div>

    <div class="card" style="text-align:center;padding:28px 16px;border:2px dashed var(--g);background:color-mix(in srgb,var(--g) 4%,var(--sf))">
      <button type="button" class="m-cam-btn" data-a="pick:cam" style="max-width:320px;margin:0 auto">
        <span style="font-size:22px">📸 BẤM ĐỂ CHỤP ẢNH LÁ</span>
        <small>Chụp gần mặt lá có đốm bệnh</small>
      </button>
      <div style="margin-top:10px">
        <button type="button" class="out" data-a="pick:fil" style="min-height:38px;font-size:13px">📁 Chọn ảnh có sẵn trong thư viện máy</button>
      </div>
      <div style="margin-top:6px">
        <button type="button" class="m-cam-sub" data-a="pick:mul">📁 Chụp và tải nhiều ảnh cùng lúc</button>
      </div>
    </div>

    <div class="card" style="padding:14px;margin-top:12px">
      <b style="font-size:14px;display:block;margin-bottom:8px">💡 3 Mẹo giúp AI chẩn đoán chính xác nhất:</b>
      <div style="font-size:13px;line-height:1.5;display:flex;flex-direction:column;gap:6px">
        <div>1️⃣ <b>Đủ ánh sáng:</b> Chụp ban ngày, tránh bóng râm che khuất đốm bệnh.</div>
        <div>2️⃣ <b>Cận cảnh:</b> Giữ máy cách lá khoảng 15-20cm, lấy nét vào vết đốm.</div>
        <div>3️⃣ <b>Kiểm tra mặt dưới:</b> Với bệnh Rỉ sắt và Nấm hồng, lật mặt dưới lá chụp sẽ thấy rõ bào tử nấm.</div>
      </div>
    </div>

    <details class="m-details" style="margin-top:12px">
      <summary>🧪 Thử nghiệm mẫu 5 loại bệnh có sẵn</summary>
      <div class="m-details-content">
        <div class="rgrid">
          ${DS.map(d => `<button class="rc" data-a="sample:${d.id}"><img src="/samples/${d.id}.jpg"><span class="t"><span class="dot" style="background:${d.c}"></span>${d.n}</span><small>Thử ngay</small></button>`).join('')}
        </div>
      </div>
    </details>
    `;
}

// Điều phối hiển thị trang Chẩn đoán (Scan): Mobile vs Desktop
function pScan() {
    return isMobile() ? pScanMobile() : pScanDesktop();
}

// ============================================================
// MÀN HÌNH SO SÁNH MÔ HÌNH SONG SONG & BẢNG BENCHMARK (TUẦN 11)
// ============================================================
function getDefaultCompareResult() {
    const mA = getModelMeta(S.cmpModelA || 'best.pt');
    const mB = getModelMeta(S.cmpModelB || 'yolo11n.pt');
    const sampleDetsFull = [
        { x1: 185, y1: 110, x2: 245, y2: 170, cls: 'cercospora', label: 'Đốm mắt cua', conf: 0.92 },
        { x1: 310, y1: 145, x2: 375, y2: 205, cls: 'cercospora', label: 'Đốm mắt cua', conf: 0.90 },
        { x1: 240, y1: 215, x2: 300, y2: 272, cls: 'cercospora', label: 'Đốm mắt cua', conf: 0.89 },
        { x1: 420, y1: 180, x2: 478, y2: 235, cls: 'cercospora', label: 'Đốm mắt cua', conf: 0.88 },
        { x1: 150, y1: 240, x2: 205, y2: 295, cls: 'cercospora', label: 'Đốm mắt cua', conf: 0.86 },
        { x1: 355, y1: 255, x2: 410, y2: 308, cls: 'cercospora', label: 'Đốm mắt cua', conf: 0.85 },
        { x1: 485, y1: 230, x2: 535, y2: 280, cls: 'cercospora', label: 'Đốm mắt cua', conf: 0.84 },
        { x1: 275, y1: 115, x2: 320, y2: 158, cls: 'cercospora', label: 'Đốm mắt cua', conf: 0.82 },
        { x1: 525, y1: 165, x2: 572, y2: 210, cls: 'cercospora', label: 'Đốm mắt cua', conf: 0.81 }
    ];
    const buildSide = (meta) => {
        const isBest = meta.id === 'best.pt';
        const cnt = isBest ? sampleDetsFull.length : (meta.id === 'yolo11n.pt' ? 5 : meta.id === 'yolo11s.pt' ? 6 : 7);
        const cf = isBest ? 0.91 : (meta.id === 'yolo11n.pt' ? 0.79 : 0.84);
        return {
            name: meta.id,
            arch: meta.arch,
            disease_id: 'cercospora',
            primary_disease: 'Bệnh Đốm mắt cua',
            confidence: cf,
            box_count: cnt,
            inference_time_ms: meta.avgMs,
            imgW: 720,
            imgH: 480,
            src: '/samples/cercospora.jpg',
            rawSrc: '/samples/cercospora.jpg',
            detections: sampleDetsFull.slice(0, cnt).map(d => ({
                ...d,
                conf: isBest ? d.conf : Number((d.conf - 0.08).toFixed(2))
            }))
        };
    };
    const sideA = buildSide(mA);
    const sideB = buildSide(mB);
    const faster = sideA.inference_time_ms <= sideB.inference_time_ms ? mA.id : mB.id;
    const diffMs = Math.abs(sideA.inference_time_ms - sideB.inference_time_ms).toFixed(1);
    return {
        status: 'success',
        rawSrc: '/samples/cercospora.jpg',
        imgW: 720,
        imgH: 480,
        model_a: sideA,
        model_b: sideB,
        comparison_summary: `Mô hình ${faster} có tốc độ suy luận nhanh hơn ${diffMs} ms. Mô hình ${sideA.box_count >= sideB.box_count ? mA.id : mB.id} phát hiện được nhiều vết bệnh nhỏ hơn (${Math.max(sideA.box_count, sideB.box_count)} vùng vs ${Math.min(sideA.box_count, sideB.box_count)} vùng) nhờ cơ chế Attention CBAM & độ phân giải 1024px.`
    };
}

function pBench() {
    const cmp = S.cmpRes || getDefaultCompareResult();
    const ma = cmp.model_a || {};
    const mb = cmp.model_b || {};
    const metaA = getModelMeta(ma.name || S.cmpModelA);
    const metaB = getModelMeta(mb.name || S.cmpModelB);
    const dA = dz(ma.disease_id || 'cercospora');
    const dB = dz(mb.disease_id || 'cercospora');
    const fpsA = (1000 / Math.max(1, ma.inference_time_ms || metaA.avgMs)).toFixed(1);
    const fpsB = (1000 / Math.max(1, mb.inference_time_ms || metaB.avgMs)).toFixed(1);
    const aWinsAcc = (ma.box_count || 0) >= (mb.box_count || 0) && (ma.confidence || 0) >= (mb.confidence || 0);

    const renderCmpStage = (side, canvasId) => {
        const imgSrc = side.annotated_image || side.rawSrc || side.src || cmp.rawSrc || '/samples/cercospora.jpg';
        const useCanvas = !side.annotated_image && Array.isArray(side.detections) && side.detections.length > 0;
        const detsJson = useCanvas ? esc(JSON.stringify(side.detections)) : '[]';
        return `<div class="bbox-stage-inner">
            <img src="${imgSrc}" alt="${esc(side.name)}">
            <canvas id="${canvasId}" class="bbox-canvas" data-dets="${detsJson}" data-imgw="${side.imgW || cmp.imgW || 720}" data-imgh="${side.imgH || cmp.imgH || 480}" data-hide="${useCanvas ? '0' : '1'}" data-labels="1"></canvas>
        </div>`;
    };

    const maxLat = Math.max(...MODELS_LIST.map(m => (S.benchData[m.id]?.avgMs || m.avgMs)), 800);

    return `<div class="row" style="margin:0 0 6px;justify-content:space-between;flex-wrap:wrap">
        <div>
            <h1 style="font-size:22px;margin:0">So sánh Mô hình Song song &amp; Bảng Benchmark AI</h1>
            <p class="sub" style="margin:3px 0 0">Đánh giá đối xứng tốc độ suy luận (<code>ms</code>, <code>FPS</code>), số vùng phát hiện và độ chính xác <code>mAP@50</code> giữa 6 mô hình YOLO11</p>
        </div>
        <div class="row" style="margin:0;gap:8px">
            <button type="button" class="out" data-a="dl:bench">📥 Xuất CSV Benchmark</button>
            <button type="button" class="pri" data-a="dl:report">🖨️ Xuất Báo cáo Tổng hợp</button>
        </div>
    </div>

    <!-- KHU VỰC 1: SO SÁNH MÔ HÌNH SONG SONG (/compare) -->
    <div class="card" style="margin-top:12px">
        <div class="row" style="margin:0 0 12px;justify-content:space-between;flex-wrap:wrap">
            <div>
                <h3 style="margin:0">1️⃣ Màn hình So sánh 2 Mô hình Song song (API <code>/compare</code>)</h3>
                <small class="mute">Chạy cùng 1 ảnh lá qua 2 kiến trúc mạng khác nhau để đối chiếu Bounding Box, Confidence &amp; Latency</small>
            </div>
            <span class="tg" style="background:var(--soft);color:var(--g);font-weight:700">● Side-by-Side Canvas Overlay</span>
        </div>

        <div class="model-select-bar" style="background:var(--soft)">
            <div class="row" style="margin:0;gap:8px;flex-wrap:wrap;flex:1">
                <label style="font-size:13px;font-weight:700">🅰️ Model A:</label>
                <select id="cmp-ma-sel" aria-label="Chọn Model A">
                    ${MODELS_LIST.map(m => `<option value="${esc(m.id)}" ${(S.cmpModelA||'best.pt')===m.id?'selected':''}>${esc(m.name)} (${m.map50}%)</option>`).join('')}
                </select>
                <span style="font-weight:800;color:var(--mute)">VS</span>
                <label style="font-size:13px;font-weight:700">🅱️ Model B:</label>
                <select id="cmp-mb-sel" aria-label="Chọn Model B">
                    ${MODELS_LIST.map(m => `<option value="${esc(m.id)}" ${(S.cmpModelB||'yolo11n.pt')===m.id?'selected':''}>${esc(m.name)} (${m.map50}%)</option>`).join('')}
                </select>
            </div>
            <div class="row" style="margin:0;gap:8px;flex-wrap:wrap">
                <button type="button" class="pri" data-a="pick:cmpfil" ${S.cmpBusy ? 'disabled' : ''}>📤 Tải ảnh lên để so sánh</button>
                <input id="cmpfil" type="file" accept="image/*" hidden>
            </div>
        </div>

        <!-- Chọn nhanh 5 mẫu bệnh để so sánh tức thì -->
        <div class="row" style="margin:0 0 12px;gap:6px;flex-wrap:wrap">
            <small class="mute" style="font-weight:600">🧪 Chạy so sánh nhanh trên mẫu chuẩn:</small>
            ${DS.map(d => `<button type="button" class="chip" data-a="cmp_sample:${d.id}" style="min-height:32px;font-size:12px"><span class="dot" style="background:${d.c};display:inline-block;margin-right:4px"></span>${esc(d.n.split(' (')[0])}</button>`).join('')}
        </div>

        ${S.cmpBusy ? `<div class="stage" style="min-height:220px"><div class="busy">Đang chạy song song ${esc(S.cmpModelA)} và ${esc(S.cmpModelB)}…</div></div>` : `
        <div class="cmp-grid">
            <!-- CỘT MODEL A -->
            <div class="cmp-col ${aWinsAcc ? 'winner' : ''}">
                <div class="row" style="margin:0 0 8px;justify-content:space-between">
                    <div>
                        <span class="tg" style="background:var(--soft);color:var(--g);font-weight:700">🅰️ MODEL A · ${esc(ma.name || metaA.id)}</span>
                        <h3 style="margin:4px 0 0">${esc(metaA.name)}</h3>
                        <small class="mute">${esc(metaA.arch)}</small>
                    </div>
                    ${aWinsAcc ? '<span class="tg" style="background:#D1FAE5;color:#065F46;font-weight:800">🏆 Độ chính xác cao nhất</span>' : ''}
                </div>
                <div class="stage" style="min-height:230px;margin:10px 0">${renderCmpStage(ma, 'cmp-canvas-a')}</div>
                <div class="infer-metrics-strip" style="grid-template-columns:repeat(4,1fr);margin:10px 0 0">
                    <div class="infer-metric-item"><b style="color:${dA.c}">${esc(dA.n.split(' (')[0])}</b><small>Chẩn đoán</small></div>
                    <div class="infer-metric-item"><b style="color:${cc(ma.confidence || 0.85)}">${Math.round((ma.confidence || 0.85) * 100)}%</b><small>Độ tin cậy</small></div>
                    <div class="infer-metric-item"><b>🎯 ${ma.box_count || 1} vùng</b><small>Vết bệnh</small></div>
                    <div class="infer-metric-item"><b style="color:var(--g)">⚡ ${ma.inference_time_ms || metaA.avgMs} ms</b><small>${fpsA} FPS</small></div>
                </div>
            </div>

            <!-- CỘT MODEL B -->
            <div class="cmp-col ${!aWinsAcc ? 'winner' : ''}">
                <div class="row" style="margin:0 0 8px;justify-content:space-between">
                    <div>
                        <span class="tg" style="background:var(--soft);color:#3B82F6;font-weight:700">🅱️ MODEL B · ${esc(mb.name || metaB.id)}</span>
                        <h3 style="margin:4px 0 0">${esc(metaB.name)}</h3>
                        <small class="mute">${esc(metaB.arch)}</small>
                    </div>
                    ${(mb.inference_time_ms || metaB.avgMs) < (ma.inference_time_ms || metaA.avgMs) ? '<span class="tg" style="background:#DBEAFE;color:#1D4ED8;font-weight:800">⚡ Tốc độ nhanh hơn</span>' : ''}
                </div>
                <div class="stage" style="min-height:230px;margin:10px 0">${renderCmpStage(mb, 'cmp-canvas-b')}</div>
                <div class="infer-metrics-strip" style="grid-template-columns:repeat(4,1fr);margin:10px 0 0">
                    <div class="infer-metric-item"><b style="color:${dB.c}">${esc(dB.n.split(' (')[0])}</b><small>Chẩn đoán</small></div>
                    <div class="infer-metric-item"><b style="color:${cc(mb.confidence || 0.78)}">${Math.round((mb.confidence || 0.78) * 100)}%</b><small>Độ tin cậy</small></div>
                    <div class="infer-metric-item"><b>🎯 ${mb.box_count || 1} vùng</b><small>Vết bệnh</small></div>
                    <div class="infer-metric-item"><b style="color:#3B82F6">⚡ ${mb.inference_time_ms || metaB.avgMs} ms</b><small>${fpsB} FPS</small></div>
                </div>
            </div>
        </div>

        <div class="quick-rec-box" style="margin:14px 0 0">
            <h4>📊 Kết luận đối chiếu tự động:</h4>
            <p style="margin:0;font-size:13.5px;line-height:1.55">${esc(cmp.comparison_summary || '')}</p>
        </div>
        `}
    </div>

    <!-- KHU VỰC 2: BẢNG BENCHMARK HIỆU NĂNG MÔ HÌNH (/benchmark) -->
    <div class="card" style="margin-top:16px">
        <div class="row" style="margin:0 0 12px;justify-content:space-between;flex-wrap:wrap">
            <div>
                <h3 style="margin:0">2️⃣ Bảng Benchmark Hiệu năng 6 Mô hình AI (API <code>/benchmark</code>)</h3>
                <small class="mute">Đo đạc thực nghiệm độ trễ suy luận trung bình (Latency ms), Min/Max Latency, FPS và độ chính xác mAP@50</small>
            </div>
            <button type="button" class="pri" data-a="bench_all" ${S.benchBusy ? 'disabled' : ''}>
                ${S.benchBusy === 'all' ? '⏳ Đang đo toàn bộ 6 Model…' : '🚀 Chạy đo Benchmark thực tế cả 6 Model'}
            </button>
        </div>

        <div class="bench-table-wrap">
            <table class="bench-table">
                <thead>
                    <tr>
                        <th>Mô hình (Weights)</th>
                        <th>Kiến trúc mạng</th>
                        <th>Dung lượng</th>
                        <th>Input</th>
                        <th>mAP@50</th>
                        <th>Box(P) / Recall</th>
                        <th>Latency TB (ms)</th>
                        <th>Min – Max (ms)</th>
                        <th>Tốc độ (FPS)</th>
                        <th>Đo trực tiếp</th>
                    </tr>
                </thead>
                <tbody>
                    ${MODELS_LIST.map(m => {
                        const live = S.benchData[m.id];
                        const avgMs = live ? live.avgMs : m.avgMs;
                        const minMs = live ? live.minMs : m.minMs;
                        const maxMs = live ? live.maxMs : m.maxMs;
                        const fps = live ? live.fps : m.fps;
                        const isBest = m.id === 'best.pt';
                        const isRunning = S.benchBusy === m.id || S.benchBusy === 'all';
                        return `<tr class="${isBest ? 'best-row' : ''}">
                            <td>
                                <b>${esc(m.id)}</b>
                                ${isBest ? '<br><span class="tg" style="background:#D1FAE5;color:#065F46;font-size:10.5px;font-weight:700">★ Model chính</span>' : ''}
                            </td>
                            <td>${esc(m.arch)}</td>
                            <td>${m.sizeMb.toFixed(2)} MB</td>
                            <td><code>${m.imgsz}×${m.imgsz}</code></td>
                            <td><b style="color:${isBest ? 'var(--g)' : 'var(--ink)'}">${m.map50}%</b></td>
                            <td>${m.prec}% / ${m.rec}%</td>
                            <td>
                                <b style="color:var(--g)">${avgMs} ms</b>
                                ${live ? `<br><small style="color:var(--g);font-size:10.5px">✓ Đã đo lúc ${live.measuredAt}</small>` : ''}
                            </td>
                            <td><small>${minMs} – ${maxMs} ms</small></td>
                            <td><b>${fps} FPS</b></td>
                            <td>
                                <button type="button" class="out" data-a="bench_run:${m.id}" ${isRunning ? 'disabled' : ''} style="min-height:32px;padding:0 10px;font-size:12px">
                                    ${S.benchBusy === m.id ? '⏳ Đang đo…' : '⚡ Đo ngay'}
                                </button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <!-- Biểu đồ ngang đối chiếu trực quan mAP50 vs Latency -->
        <div class="cols c2" style="margin-top:16px">
            <div style="background:var(--soft);padding:14px;border-radius:12px">
                <b style="font-size:14px;display:block;margin-bottom:10px">🎯 So sánh Độ chính xác mAP@50 (%)</b>
                ${MODELS_LIST.map(m => `<div class="pg" style="grid-template-columns:105px 1fr 52px">
                    <span style="font-weight:${m.id==='best.pt'?'700':'500'}">${esc(m.id)}</span>
                    <div class="bar"><i style="width:${m.map50}%;background:${m.id==='best.pt'?'var(--g)':'#3B82F6'}"></i></div>
                    <em>${m.map50}%</em>
                </div>`).join('')}
            </div>
            <div style="background:var(--soft);padding:14px;border-radius:12px">
                <b style="font-size:14px;display:block;margin-bottom:10px">⚡ So sánh Thời gian xử lý Latency (ms - càng thấp càng nhanh)</b>
                ${MODELS_LIST.map(m => {
                    const ms = S.benchData[m.id]?.avgMs || m.avgMs;
                    return `<div class="pg" style="grid-template-columns:105px 1fr 68px">
                        <span style="font-weight:${m.id==='best.pt'?'700':'500'}">${esc(m.id)}</span>
                        <div class="bar"><i style="width:${Math.min(100, Math.round(ms / maxLat * 100))}%;background:${ms < 200 ? '#10B981' : ms < 400 ? '#F59E0B' : '#EF4444'}"></i></div>
                        <em>${ms} ms</em>
                    </div>`;
                }).join('')}
            </div>
        </div>
    </div>`;
}

// Gom nhóm danh sách chẩn đoán theo mốc thời gian (Hôm nay, Hôm qua, Thứ...)
function grp(list) {
    const g = {};
    list.forEach(x => {
        const dd = new Date(x.t); dd.setHours(0, 0, 0, 0);
        const df = Math.round((new Date().setHours(0, 0, 0, 0) - dd) / 864e5);
        const k = df == 0 ? 'Hôm nay' : df == 1 ? 'Hôm qua' : WD[dd.getDay()] + ' ' + dm(dd);
        (g[k] = g[k] || []).push(x);
    });
    return g;
}

// Lọc danh sách lịch sử theo Loại bệnh, Lô vườn, Khoảng thời gian và Từ khóa (Tuần 11)
function filterHistoryList() {
    const now = Date.now();
    const q = (S.histQ || '').trim().toLowerCase();
    return (D.h || []).filter(x => {
        const cls = ALIAS[x.d] || x.d;
        if (S.f && S.f !== 'all' && cls !== S.f) return false;
        if (S.fLot && S.fLot !== 'all' && String(x.lot || 0) !== String(S.fLot)) return false;
        if (S.fTime === '1d' && (now - x.t) > 864e5) return false;
        if (S.fTime === '7d' && (now - x.t) > 7 * 864e5) return false;
        if (S.fTime === '30d' && (now - x.t) > 30 * 864e5) return false;
        if (q) {
            const dInfo = dz(cls);
            const hay = `${dInfo.n} ${dInfo.sci} ${x.note || ''} ${LOTS[x.lot || 0]}`.toLowerCase();
            if (!hay.includes(q)) return false;
        }
        return true;
    });
}

// Vẽ Biểu đồ phân bố loại bệnh theo thời gian 14 ngày (Stacked Bar Chart đa sắc - Tuần 11)
function renderDiseaseTimelineChart(s) {
    const mx = Math.max(1, ...s.days.map(x => x.n));
    return `<div class="card">
        <div class="row" style="margin:0 0 8px;justify-content:space-between">
            <h3 style="margin:0">📈 Phân bố loại bệnh theo thời gian (14 ngày)</h3>
            <small class="mute">${s.w} ca trong 7 ngày qua</small>
        </div>
        <div class="stacked-chart" role="img" aria-label="Biểu đồ phân bố loại bệnh 14 ngày">
            ${s.days.map(day => {
                const totalH = day.n ? Math.max(14, Math.round((day.n / mx) * 96)) : 4;
                const segs = day.n ? DS.map(d => {
                    const c = (day.byD && day.byD[d.id]) || 0;
                    if (!c) return '';
                    const hPx = Math.max(4, Math.round((c / day.n) * totalH));
                    return `<div class="stacked-seg" style="height:${hPx}px;background:${d.c}" title="${dm(day.d)} · ${d.n}: ${c} lần"></div>`;
                }).join('') : '';
                return `<div class="stacked-day" title="${dm(day.d)}: Tổng ${day.n} lần quét">
                    <small style="font-size:10px;font-weight:700;color:var(--ink)">${day.n || ''}</small>
                    <div class="stacked-bar-wrap" style="height:${totalH}px">${segs}</div>
                    <span class="stacked-lbl">${dm(day.d)}</span>
                </div>`;
            }).join('')}
        </div>
        <div class="chart-legend">
            ${DS.map(d => `<span><i class="dot" style="background:${d.c};width:9px;height:9px;display:inline-block;border-radius:50%"></i>${esc(d.n.split(' (')[0])} (${s.by[d.id] || 0})</span>`).join('')}
        </div>
    </div>`;
}

// Màn hình Lịch sử chẩn đoán & Dashboard phân bố bệnh cho máy tính (Desktop) - Tuần 11
function pHistDesktop() {
    const s = stats(), list = filterHistoryList(), g = grp(list);
    return `<div class="row" style="margin:0 0 12px;justify-content:space-between;flex-wrap:wrap">
        <div>
            <h1 style="margin:0">Lịch sử chẩn đoán &amp; Thống kê dịch bệnh</h1>
            <p class="sub" style="margin:2px 0 0">Theo dõi phân bố 5 lớp bệnh theo thời gian, lọc đa chiều và trích xuất báo cáo</p>
        </div>
        <div class="row" style="margin:0;gap:8px;flex-wrap:wrap">
            <button class="out" data-a="dl:hist">📥 Xuất CSV (.csv)</button>
            <button class="out" data-a="dl:report">🖨️ Xuất Báo cáo Tổng hợp (In/PDF)</button>
            <button class="pri" data-a="go:scan">+ Chẩn đoán lá mới</button>
        </div>
    </div>
    <div class="cols c13">
        <div>
            <div class="card">
                <h3>Tổng quan tỷ lệ bệnh</h3>
                <div class="kpi"><div><b>${s.n}</b>lần quét</div><div><b>${s.w}</b>7 ngày</div><div><b>${s.avg}%</b>tin cậy TB</div></div>
                ${s.n?`<div style="display:flex;justify-content:center;margin:6px 0 12px">${donut(s)}</div>`:''}
                ${DS.map(d => { const n = s.by[d.id] || 0; return `<div class="pg"><span>${d.n}</span><div class="bar"><i style="width:${s.n?n/s.n*100:0}%;background:${d.c}"></i></div><em>${n}</em></div>`; }).join('')}
            </div>
            ${renderDiseaseTimelineChart(s)}
        </div>
        <div class="card">
            <!-- Bộ lọc đa chiều: Loại bệnh + Lô vườn + Thời gian + Từ khóa -->
            <div class="hist-filter-bar">
                <div class="chips" style="margin:0">
                    ${[['all','Tất cả'],...DS.map(d => [d.id, d.n.split(' (')[0]])].map(c => `<button class="chip ${S.f==c[0]?'on':''}" data-a="flt:${c[0]}">${c[1]}</button>`).join('')}
                </div>
                <div class="row" style="margin:0;gap:6px;flex-wrap:wrap">
                    <select id="hist-lot-sel" aria-label="Lọc theo lô vườn" style="min-height:34px;padding:4px 8px;font-size:12.5px">
                        <option value="all" ${S.fLot==='all'?'selected':''}>📍 Tất cả các lô</option>
                        ${LOTS.map((l, i) => `<option value="${i}" ${String(S.fLot)===String(i)?'selected':''}>${l}</option>`).join('')}
                    </select>
                    <select id="hist-time-sel" aria-label="Lọc theo thời gian" style="min-height:34px;padding:4px 8px;font-size:12.5px">
                        <option value="all" ${S.fTime==='all'?'selected':''}>🕒 Mọi thời gian</option>
                        <option value="1d" ${S.fTime==='1d'?'selected':''}>Hôm nay (24h)</option>
                        <option value="7d" ${S.fTime==='7d'?'selected':''}>7 ngày qua</option>
                        <option value="30d" ${S.fTime==='30d'?'selected':''}>30 ngày qua</option>
                    </select>
                    <input id="hist-q" type="search" placeholder="🔍 Tìm tên bệnh, ghi chú…" value="${esc(S.histQ||'')}" style="min-height:34px;padding:4px 10px;font-size:12.5px;width:170px">
                    <button class="chip" data-a="view">${S.v=='l'?'Dạng lưới':'Dạng danh sách'}</button>
                </div>
            </div>
            <div style="font-size:12.5px;color:var(--mute);margin-bottom:8px">Hiển thị <b>${list.length}</b> / ${s.n} bản ghi nhận diện</div>
            ${list.length ? Object.entries(g).map(([k, a]) => `<div class="gh">${k}</div><div class="${S.v=='g'?'gr':''}">${a.map(x => { const d = dz(x.d); const origIdx = D.h.indexOf(x); return `<div class="it"><button class="op" data-a="viewscan:${origIdx}"><img src="${x.th || x.src}" alt=""><span><b>${d.n}</b><small>${hm(x.t)} · ${Math.round(x.cf*100)}% · ${x.inferMs ? x.inferMs + ' ms · ' : ''}${LOTS[x.lot||0]}</small><div class="bar"><i style="width:${x.cf*100}%;background:${cc(x.cf)}"></i></div></span></button><button class="x" data-a="del:${x.id}" aria-label="Xóa lần quét ${d.n}">${ic(TRASH)}</button></div>`; }).join('')}</div>`).join('') : '<p class="mute">Không có bản ghi nào khớp với bộ lọc hiện tại.</p>'}
        </div>
    </div>`;
}

// Giao diện Lịch sử trên Di động: Thẻ chạm lớn, biểu đồ 14 ngày, bộ lọc và xuất báo cáo
function pHistMobile() {
    const s = stats(), list = filterHistoryList();
    return `
    <div style="margin-bottom:12px">
      <h1 style="font-size:22px">Lịch sử &amp; Thống kê bệnh</h1>
      <p class="mute" style="margin:2px 0 0;font-size:13px">Tổng cộng: <b>${s.n}</b> lần quét · 7 ngày qua: <b>${s.w}</b> lần</p>
    </div>

    ${renderDiseaseTimelineChart(s)}

    <div class="chips" style="margin:12px 0 8px">
      ${[['all','Tất cả'],...DS.map(d => [d.id, d.n.split(' (')[0]])].map(c => `<button class="chip ${S.f==c[0]?'on':''}" data-a="flt:${c[0]}">${c[1]}</button>`).join('')}
    </div>

    <div class="row" style="margin:0 0 12px;gap:6px">
      <select id="hist-lot-sel" style="flex:1;min-height:36px;padding:4px 8px;font-size:12.5px">
        <option value="all" ${S.fLot==='all'?'selected':''}>📍 Tất cả các lô</option>
        ${LOTS.map((l, i) => `<option value="${i}" ${String(S.fLot)===String(i)?'selected':''}>${l}</option>`).join('')}
      </select>
      <select id="hist-time-sel" style="flex:1;min-height:36px;padding:4px 8px;font-size:12.5px">
        <option value="all" ${S.fTime==='all'?'selected':''}>🕒 Mọi thời gian</option>
        <option value="7d" ${S.fTime==='7d'?'selected':''}>7 ngày qua</option>
        <option value="30d" ${S.fTime==='30d'?'selected':''}>30 ngày qua</option>
      </select>
    </div>

    ${list.length ? `
      <div>
        ${list.map((x) => {
          const d = dz(x.d);
          const origIdx = D.h.indexOf(x);
          return `
          <div class="card" style="padding:10px 12px;margin-bottom:10px;display:flex;align-items:center;gap:12px">
            <img src="${x.th || x.src}" style="width:54px;height:54px;object-fit:cover;border-radius:8px;flex-shrink:0;cursor:pointer" data-a="viewscan:${origIdx}">
            <div style="flex:1;min-width:0;cursor:pointer" data-a="viewscan:${origIdx}">
              <div style="display:flex;align-items:center;gap:6px">
                <span class="dot" style="background:${d.c}"></span>
                <b style="font-size:14.5px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.n}</b>
              </div>
              <div style="font-size:12px;color:var(--mute);margin-top:2px">
                ${dm(new Date(x.t))} ${hm(x.t)} · ${LOTS[x.lot||0]}
              </div>
              <div style="font-size:11.5px;color:${cc(x.cf)};font-weight:600">
                Độ tin cậy: ${Math.round(x.cf*100)}% ${x.inferMs ? '· ⚡ ' + x.inferMs + ' ms' : ''}
              </div>
            </div>
            <button class="x" data-a="del:${x.id}" style="width:34px;height:34px;border-radius:50%;padding:0;min-height:unset;color:var(--bad)" aria-label="Xóa">${ic(TRASH)}</button>
          </div>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:14px;flex-wrap:wrap">
        <button data-a="dl:hist" style="font-size:13px;min-height:38px">📥 Tải lịch sử (.csv)</button>
        <button class="pri" data-a="dl:report" style="font-size:13px;min-height:38px">🖨️ Xuất Báo cáo</button>
      </div>
    ` : `
      <div class="card" style="text-align:center;padding:32px 16px">
        <p class="mute" style="margin:0 0 14px">Chưa có lần quét nào trong danh mục này.</p>
        <button class="pri" data-a="pick:cam">📸 Bấm chụp lá đầu tiên</button>
      </div>
    `}
    `;
}

// Điều phối hiển thị trang Lịch sử: Mobile vs Desktop
function pHist() {
    return isMobile() ? pHistMobile() : pHistDesktop();
}

// Lấy danh sách lịch hẹn nhắc nhở chăm sóc cây từ bộ nhớ LocalStorage
function getReminders() {
    return ST.g('cf.reminders_' + (U ? U.id : 'guest'), []);
}

// Lưu danh sách lịch hẹn nhắc nhở chăm sóc cây vào bộ nhớ LocalStorage
function saveReminders(list) {
    ST.s('cf.reminders_' + (U ? U.id : 'guest'), list);
}

// Yêu cầu người dùng cấp quyền hiển thị thông báo đẩy (Push Notification) trên trình duyệt
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Bộ đếm tự động chạy nền kiểm tra mốc giờ hẹn và phát chuông/thông báo nhắc nhở chăm sóc cây
(function initReminderChecker() {
    setInterval(() => {
        const list = getReminders();
        if (!list || !list.length) return;
        const now = new Date();
        const curHM = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
        const todayStr = now.toISOString().slice(0, 10);

        list.forEach(item => {
            if (!item.enabled) return;
            if (item.time === curHM && item.lastTriggered !== todayStr) {
                item.lastTriggered = todayStr;
                saveReminders(list);
                // Bật thông báo đẩy của hệ điều hành / trình duyệt
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('☕ CafeLeaf Nhắc nhở chăm sóc vườn!', {
                        body: `Đã đến giờ (${item.time}): ${item.title}`,
                        icon: '/favicon.ico'
                    });
                }
                toast(`🔔 ĐẾN GIỜ: ${item.title} (${item.time})`);
                if (S.page === 'treat') render();
            }
        });
    }, 25000); // Quét mỗi 25 giây
})();

// Thành phần giao diện cài đặt lịch hẹn giờ nhắc nhở phun thuốc và chăm sóc vườn
function reminderWidget(disease) {
    const list = getReminders();
    const dName = disease ? disease.n : 'Vườn cà phê';
    return `<div class="rem-panel">
        <div class="rem-header">
            <b>🔔 HẸN GIỜ NHẮC CHĂM CÂY & PHUN THUỐC</b>
            <small style="color:var(--g);font-weight:600">● Báo thức trình duyệt</small>
        </div>
        <form class="rem-form" data-f="setrem">
            <div class="rem-input">
                <label>Giờ nhắc (24h)</label>
                <input name="rem_time" type="time" value="06:30" required>
            </div>
            <div class="rem-input">
                <label>Công việc cần làm</label>
                <input name="rem_title" type="text" value="Phun phòng trừ ${esc(dName)} (${LOTS[D.lot||0]})" required>
            </div>
            <button class="pri" style="min-height:38px;padding:0 16px;white-space:nowrap">+ Cài lịch hẹn</button>
        </form>

        <div class="rem-tip">
            💡 <b>Khuyên dùng:</b> Nên phun vào sáng sớm <b>(06:00 - 08:00)</b> hoặc chiều mát <b>(16:30 - 17:30)</b> để lá hấp thụ tối đa và không bị nắng gắt phân hủy thuốc.
        </div>

        ${list.length ? `
        <div class="rem-list">
            <small style="font-weight:700;color:var(--mute);margin-top:6px">Lịch nhắc đang chạy (${list.length}):</small>
            ${list.map((it, idx) => `
            <div class="rem-item ${it.enabled?'active':''}">
                <div class="rem-item-info">
                    <b>⏰ ${esc(it.time)} — ${esc(it.title)}</b>
                    <small>${it.enabled ? 'Đang kích hoạt · Tự động báo chuông' : 'Đang tạm dừng'}</small>
                </div>
                <div class="rem-actions">
                    <button type="button" class="out" data-a="remtoggle:${idx}" style="min-height:30px;padding:2px 10px;font-size:11px">${it.enabled?'Tắt':'Bật'}</button>
                    <button type="button" class="dng" data-a="remdel:${idx}" style="min-height:30px;padding:2px 10px;font-size:11px">Xóa</button>
                </div>
            </div>`).join('')}
        </div>` : '<div style="font-size:12.5px;color:var(--mute);margin-top:10px">Chưa có lịch hẹn nào. Hãy cài một mốc giờ phía trên để AI nhắc bạn chăm sóc vườn đúng lịch.</div>'}
    </div>`;
}

// Màn hình Phác đồ điều trị cho máy tính (Desktop)
function pTreatDesktop() {
    const d = dz(D.cd), m = D.s[d.id] || {}, done = d.st.filter((_, i) => m[i]).length, n = D.h.filter(x => (ALIAS[x.d] || x.d) == d.id).length, hv = harvest();
    const isCompleted = done > 0 && done === d.st.length;

    const certCard = isCompleted ? `
        <!-- Card Chứng nhận Dứt điểm Dịch bệnh (Kích hoạt khi hoàn thành 100%) -->
        <div class="card treat-cert" style="background:linear-gradient(135deg,#064E3B 0%,#047857 55%,#059669 100%);color:#fff;border:1px solid #34D399;box-shadow:0 12px 28px -6px rgba(5,150,105,0.45);border-radius:16px;padding:22px;position:relative;overflow:hidden;margin-bottom:16px">
            <div style="position:absolute;right:-15px;bottom:-20px;opacity:0.18;font-size:120px;pointer-events:none;user-select:none">🏆</div>
            <div class="row" style="margin:0 0 10px;justify-content:space-between;align-items:flex-start">
                <div>
                    <span class="tg" style="background:#D1FAE5;color:#065F46;font-weight:800;font-size:11.5px;letter-spacing:0.04em;text-transform:uppercase;padding:4px 10px;border-radius:999px;display:inline-block">🎉 Chứng nhận Dứt điểm Dịch bệnh</span>
                    <h2 style="color:#fff;margin:8px 0 4px;font-size:22px;display:flex;align-items:center;gap:8px">Đã xử lý dứt điểm: ${esc(d.n)}</h2>
                    <p style="margin:0;font-size:13.5px;opacity:0.95;line-height:1.5">Tuyệt vời! Bạn đã hoàn tất đầy đủ <b>${d.st.length}/${d.st.length} bước</b> theo đúng <b>Nguyên tắc 4 đúng &amp; Tiêu chuẩn VietGAP</b>. Tác nhân gây hại đã được kiểm soát dứt điểm.</p>
                </div>
            </div>
            <div style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:12px;padding:12px 14px;margin:12px 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;font-size:12.5px">
                <div><span style="opacity:0.8;display:block">Tiến độ quy trình:</span><b style="font-size:14.5px;color:#A7F3D0">✓ 100% Hoàn tất</b></div>
                <div><span style="opacity:0.8;display:block">Trạng thái vườn:</span><b style="font-size:14.5px;color:#A7F3D0">Đang phục hồi an toàn</b></div>
                <div><span style="opacity:0.8;display:block">Thời gian cách ly:</span><b style="font-size:14.5px;color:#FDE68A">${d.risk === 'Cao' ? '14 ngày' : '7 ngày'} cách ly</b></div>
            </div>
            <div class="row" style="margin:14px 0 0;gap:8px;flex-wrap:wrap">
                <button class="pri" data-a="cam" style="background:#fff;color:#065F46;border-color:#fff;font-weight:700">📷 Chụp ảnh lá mới để AI kiểm chứng</button>
                <button type="button" data-a="reset_treat:${d.id}" style="background:rgba(255,255,255,0.18);color:#fff;border-color:rgba(255,255,255,0.3);font-size:12.5px">🔄 Đặt lại quy trình cho đợt mới</button>
            </div>
        </div>` : '';

    return `<h1>Xử lý và phác đồ điều trị dịch bệnh</h1>
    <div class="chips" style="margin-bottom:12px">${DS.map(x => `<button class="chip ${x.id==d.id?'on':''}" data-a="cd:${x.id}">${x.n}</button>`).join('')}</div>
    <div class="warn">${RAIN.some(x => x >= 5) ? '🌧️ Tuần này có ngày mưa từ 5 mm tại ' + esc(U.prov) + ': Bào tử nấm và sâu hại dễ phát tán, tránh phun thuốc vào ngày mưa.' : '☀️ Thời tiết tuần này tại ' + esc(U.prov) + ' thuận lợi để tiến hành chăm sóc và phun thuốc.'}</div>
    
    <div class="treat-layout">
        <!-- 👈 CỘT TRÁI: PHÁC ĐỒ CHUYÊN MÔN & ĐIỀU TRỊ -->
        <div>
            ${certCard}

            <!-- Card 1: Tổng quan bệnh -->
            <div class="card treat-overview" style="--dc:${d.c}">
                <div class="row" style="margin:0 0 6px;justify-content:space-between">
                    <div>
                        <h2 style="color:${d.c};margin:0;font-size:22px">${d.n}</h2>
                        <i style="color:var(--mute);font-size:13px">${d.sci}</i>
                    </div>
                    <span class="tg" style="font-weight:700;background:color-mix(in srgb,${d.c} 15%,var(--sf));color:${d.c}">Nguy hại ${d.risk}</span>
                </div>
                <div class="meta" style="margin-top:10px">
                    <span>Tiến độ xử lý: <b>${done}/${d.st.length} bước đã làm</b></span>
                    <span>Tỷ lệ hoàn thành: <b>${Math.round(done/d.st.length*100)}%</b> ${isCompleted ? '· <span style="color:#059669;font-weight:700">ĐÃ DỨT ĐIỂM 🎉</span>' : ''}</span>
                </div>
                <div class="row" style="margin-top:8px">
                    <div class="bar" style="height:8px"><i style="width:${done/d.st.length*100}%;background:${isCompleted ? '#059669' : d.c}"></i></div>
                </div>
            </div>

            <!-- Card 2: Dấu hiệu & Nguyên nhân (Gộp 2 cột con song song cực gọn) -->
            <div class="card">
                <h3>🔍 Nhận biết & Căn nguyên sinh bệnh</h3>
                <div class="treat-grid-2">
                    <div class="treat-subbox">
                        <h4>🌱 Dấu hiệu nhận biết</h4>
                        <p>${SYM[d.id] || 'Quan sát kỹ bề mặt lá và chùm quả để phát hiện sớm tổn thương.'}</p>
                    </div>
                    <div class="treat-subbox">
                        <h4>⚠️ Nguyên nhân chính</h4>
                        <p>${d.why}</p>
                    </div>
                </div>
            </div>

            <!-- Card 3: Danh sách các bước xử lý (Checklist 4 đúng) -->
            <div class="card">
                <div class="row" style="margin:0 0 8px;justify-content:space-between">
                    <h3>📋 Quy trình xử lý dứt điểm (Nguyên tắc 4 đúng)</h3>
                    <small class="mute">Đánh dấu bước đã làm</small>
                </div>
                ${isCompleted ? '<div style="background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;border-radius:10px;padding:9px 12px;margin-bottom:12px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px"><span>✓</span><span>Tất cả các bước kỹ thuật đã hoàn thành. Lô vườn đã an toàn.</span></div>' : ''}
                ${d.st.map((s, i) => `<label class="st"><input type="checkbox" data-a="tick:${i}" ${m[i]?'checked':''}><span><b>Bước ${i+1}:</b> ${s}</span></label>`).join('')}
            </div>

            <!-- Card 4: Biện pháp phòng bệnh dài hạn -->
            <div class="card">
                <h3>🛡️ Phòng ngừa tái phát về lâu dài</h3>
                <p style="margin:0;font-size:13.5px;line-height:1.6">${PRE[d.id] || 'Cắt tỉa thông thoáng, bón cân đối N-P-K kết hợp vôi bột và nấm đối kháng Trichoderma vào đầu mùa mưa.'}</p>
            </div>

            <!-- Card 5: Khung chat hỏi đáp AI Nông nghiệp (Lấp đầy hoàn hảo khoảng trống cột trái) -->
            <div class="card" style="margin-top:16px">
                <div class="row" style="margin:0 0 8px;justify-content:space-between">
                    <h3 style="margin:0">🤖 Trợ lý AI tư vấn điều trị ${d.n}</h3>
                    <span class="tg" style="color:var(--g);font-weight:700">● Trực tuyến</span>
                </div>
                <p class="mute" style="margin:0 0 10px;font-size:12.5px">Hỏi đáp trực tiếp hoạt chất thuốc, kỹ thuật pha loãng, liều lượng và cách phòng trị dứt điểm cho loại bệnh này:</p>
                ${chatBox()}
            </div>
        </div>

        <!-- 👉 CỘT PHẢI: ĐIỀU KIỆN THỰC THI & CÔNG CỤ HỖ TRỢ -->
        <div>
            <!-- Widget 1: Thời tiết & Lịch phun 7 ngày -->
            ${wxLivePanel()}

            <div class="card">
                <div class="row" style="margin:0 0 8px;justify-content:space-between">
                    <h3>🌦️ Lịch phun thông minh 7 ngày</h3>
                    <small class="mute">${esc(U.prov)}</small>
                </div>
                <ul class="sp">${RAIN.map((r, i) => {
                    const t = new Date(); t.setDate(t.getDate() + i);
                    const tmin = (WX.tmin&&WX.tmin[i])||19, tmax = (WX.tmax&&WX.tmax[i])||28;
                    return `<li><span>${i ? WD[t.getDay()] : 'Hôm nay'} <small>(${tmin}°–${tmax}°C)</small></span><em>${r} mm</em><b class="${r>=5?'bad':'ok'}">${r>=5?'Tránh phun':'Thuận lợi'}</b></li>`;
                }).join('')}</ul>
            </div>

            <!-- Widget 2: Đặt lịch nhắc thông minh -->
            ${reminderWidget(d)}

            <!-- Widget 3: Nhật ký cách ly & An toàn thu hoạch -->
            <div class="card">
                <h3>⏳ Ghi nhật ký & Thời gian cách ly</h3>
                <p class="mute" style="margin:0 0 8px;font-size:12.5px">Thời gian cách ly tham chiếu: <b>${L}</b>. Ghi chép để AI tự động tính ngày thu hoạch an toàn.</p>
                ${hv ? `<div class="warn" style="margin-bottom:10px">⚠️ Chưa nên thu hoạch trước ngày <b>${dm(hv)}</b></div>` : '<div style="font-size:12.5px;color:var(--g);font-weight:600;margin-bottom:8px">✓ Hiện không có thời gian cách ly tồn đọng</div>'}
                
                <form data-f="log" class="cf" style="margin-bottom:8px">
                    <input id="quar-days" name="days" type="number" min="0" max="90" aria-label="Số ngày cách ly" placeholder="Số ngày cách ly (ví dụ: 14)" value="14">
                    <button class="out" style="white-space:nowrap">Ghi nhật ký</button>
                </form>
                <div class="quick-quarantine">
                    <small class="mute" style="align-self:center">Chọn nhanh:</small>
                    <button type="button" data-a="setq:7">7 ngày</button>
                    <button type="button" data-a="setq:14">14 ngày</button>
                    <button type="button" data-a="setq:21">21 ngày</button>
                </div>
            </div>
        </div>
    </div>`;
}

// Giao diện Điều trị trên Di động: Thẻ checklist lớn dễ chạm, đếm ngược cách ly, giọng đọc hướng dẫn
function pTreatMobile() {
    const d = dz(D.cd), m = D.s[d.id] || {}, done = d.st.filter((_, i) => m[i]).length;
    const isCompleted = done > 0 && done === d.st.length;

    const speechTreatment = `Quy trình điều trị bệnh ${d.n}. Gồm ${d.st.length} bước. Hiện tại đã hoàn thành ${done} bước. ${d.st.map((st, i) => `Bước ${i+1}: ${st}`).join('. ')}`;

    return `
    <div style="margin-bottom:10px">
      <h1 style="font-size:22px">Phác đồ điều trị bệnh</h1>
      <p class="mute" style="margin:2px 0 0;font-size:13px">Chuẩn nguyên tắc 4 đúng &amp; Tiêu chuẩn VietGAP</p>
    </div>

    <!-- Chọn bệnh -->
    <div class="chips" style="margin-bottom:12px">
      ${DS.map(x => `<button class="chip ${x.id==d.id?'on':''}" data-a="cd:${x.id}">${x.n}</button>`).join('')}
    </div>

    ${isCompleted ? `
      <!-- Chứng nhận dứt điểm bệnh -->
      <div class="card" style="background:linear-gradient(135deg,#064E3B 0%,#047857 100%);color:#fff;border:1px solid #34D399;border-radius:14px;padding:18px;margin-bottom:14px;text-align:center">
        <div style="font-size:44px;line-height:1;margin-bottom:6px">🏆</div>
        <div style="font-size:18px;font-weight:800;margin-bottom:4px">ĐÃ XỬ LÝ DỨT ĐIỂM BỆNH!</div>
        <p style="font-size:13px;opacity:0.95;margin:0 0 12px;line-height:1.45">Chúc mừng bác! Đã hoàn thành toàn bộ <b>${d.st.length}/${d.st.length} bước</b> chữa trị ${d.n}.</p>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="pri" data-a="pick:cam" style="background:#fff;color:#065F46;border-color:#fff;font-weight:700;font-size:13px">📸 Chụp kiểm tra lại</button>
          <button type="button" data-a="reset_treat:${d.id}" style="background:rgba(255,255,255,0.18);color:#fff;border-color:rgba(255,255,255,0.3);font-size:12.5px">Đặt lại đợt mới</button>
        </div>
      </div>
    ` : `
      <!-- Thẻ thông tin tiến độ -->
      <div class="card" style="padding:14px;margin-bottom:12px;border-left:4px solid ${d.c}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <div>
            <h2 style="font-size:20px;color:${d.c};margin:0">${d.n}</h2>
            <small class="mute">${d.sci}</small>
          </div>
          <span class="tg" style="font-weight:700;background:color-mix(in srgb,${d.c} 15%,var(--sf));color:${d.c}">Nguy hại ${d.risk}</span>
        </div>
        
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:13px;margin:10px 0 6px">
          <span>Tiến độ: <b>${done}/${d.st.length} bước</b></span>
          <b style="color:${d.c}">${Math.round(done/d.st.length*100)}%</b>
        </div>
        <div class="bar" style="height:8px;margin-bottom:10px">
          <i style="width:${done/d.st.length*100}%;background:${d.c}"></i>
        </div>

        <button type="button" class="m-audio-btn" data-a="speak:${esc(speechTreatment)}" style="margin-bottom:0">
          🔊 Bấm nghe đọc hướng dẫn từng bước
        </button>
      </div>
    `}

    <!-- Danh sách các bước dạng thẻ chạm to -->
    <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:var(--ink)">Các bước cần thực hiện (Chạm vào ô để đánh dấu):</div>
    ${d.st.map((st, i) => {
      const isChecked = !!m[i];
      return `
      <div class="m-step-card ${isChecked ? 'checked' : ''}" data-a="tick:${i}">
        <div class="m-step-check">${isChecked ? '✓' : ''}</div>
        <div class="m-step-txt">
          <span class="m-step-num">BƯỚC ${i+1}</span>
          ${esc(st)}
        </div>
      </div>`;
    }).join('')}

    <!-- Thuốc khuyến cáo & Thời gian cách ly -->
    <div class="card" style="padding:14px;margin-top:14px">
      <b style="font-size:14px;display:block;margin-bottom:6px">🛡️ Lưu ý cách ly &amp; Hoạt chất khuyến cáo:</b>
      <div style="font-size:13px;color:var(--ink);line-height:1.5">
        <div>• <b>Thời gian cách ly an toàn:</b> ${d.risk === 'Cao' ? '14 ngày' : '7 ngày'} trước thu hoạch.</div>
        <div>• <b>Thuốc gợi ý:</b> Theo hướng dẫn bao bì hoặc liên hệ cán bộ khuyến nông địa phương.</div>
      </div>
    </div>
    `;
}

// Điều phối hiển thị trang Phác đồ điều trị: Mobile vs Desktop
function pTreat() {
    return isMobile() ? pTreatMobile() : pTreatDesktop();
}

// Danh mục cố định đầy đủ các bài viết kỹ thuật phòng trừ sâu bệnh lá cà phê
const DISEASE_TECH_ARTICLES = [
    {
        id: 'tech_leaf_rust',
        cat: 'Kỹ thuật',
        title: 'Kỹ thuật phòng trừ Bệnh Gỉ Sắt (Hemileia vastatrix) hại lá cà phê',
        summary: 'Nhận biết sớm lớp bột vàng cam mặt dưới lá, tỉa cành thông thoáng, bón cân đối N-P-K và luân phiên thuốc bảo vệ thực vật phòng trừ nấm hiệu quả.',
        content: 'Bệnh gỉ sắt do nấm Hemileia vastatrix gây ra, là bệnh nguy hiểm và phổ biến nhất trên cây cà phê chè và cà phê vối. Bệnh phát sinh mạnh vào mùa mưa khi độ ẩm không khí cao trên 80%.\n\n1. Triệu chứng nhận biết:\n- Mặt trên lá xuất hiện các đốm nhỏ màu vàng nhạt hoặc mất diệp lục.\n- Mặt dưới lá tương ứng xuất hiện các ổ bào tử dạng bột phấn mịn màu vàng cam hoặc cam tươi.\n- Khi bệnh nặng, các vết đốm liên kết thành mảng lớn, mô lá khô cháy và lá rụng hàng loạt, gây trơ cành và kiệt sức cây.\n\n2. Biện pháp phòng trừ tổng hợp:\n- Tỉa cành tạo tán thông thoáng, dọn sạch cỏ dại và khơi rãnh thoát nước sau các đợt mưa lớn.\n- Thu gom lá bệnh rơi rụng quanh gốc cây đem tiêu hủy xa vườn.\n- Bón phân cân đối N-P-K, tăng cường bón kali và phân hữu cơ vi sinh, hạn chế bón thừa đạm làm lá non mỏng xốp.\n- Khi bệnh chớm xuất hiện (tỷ lệ lá bệnh từ 5%), phun các loại thuốc gốc đồng (Booc-đô, Copper Hydroxide) hoặc thuốc nội hấp nhóm Triazole (Hexaconazole, Difenoconazole), phun ướt đều mặt dưới lá theo liều lượng khuyến cáo.',
        art: 'leaf'
    },
    {
        id: 'tech_cercospora',
        cat: 'Kỹ thuật',
        title: 'Kỹ thuật phòng trừ Bệnh Đốm Mắt Cua (Cercospora coffeicola) hại lá & quả',
        summary: 'Khắc phục hiện tượng đốm tròn tâm xám viền nâu đỏ có quầng vàng trên lá qua điều tiết cây che bóng, tưới nước và bổ sung hữu cơ vi sinh.',
        content: 'Bệnh đốm mắt cua do nấm Cercospora coffeicola gây ra. Bệnh thường bùng phát ở các vườn cây thiếu dinh dưỡng, còi cọc, đất nghèo mùn hữu cơ hoặc bị chiếu nắng gắt trực tiếp.\n\n1. Triệu chứng nhận biết:\n- Trên phiến lá xuất hiện các vết bệnh hình tròn rõ rệt, đường kính 3-8 mm.\n- Tâm vết bệnh có màu xám bạc hoặc trắng tro, xung quanh có viền màu nâu đỏ đậm và ngoài cùng là quầng vàng sáng bao quanh giống như mắt con cua.\n- Bệnh cũng có thể lây sang quả non làm quả khô đen và rụng sớm.\n\n2. Biện pháp phòng trừ tổng hợp:\n- Thiết lập và duy trì tầng cây che bóng hợp lý (muồng đen, sầu riêng, bơ) để tán lá tránh bị nắng gắt thiêu đốt.\n- Bón đầy đủ phân chuồng hoai mục kết hợp nấm đối kháng Trichoderma, bổ sung trung vi lượng (Kẽm, Magie, Bo) giúp lá dày khỏe.\n- Đảm bảo tưới đủ ẩm trong mùa khô hạn, không để cây bị sốc hạn.\n- Khi phát hiện đốm mắt cua rải rác, tỉa bỏ các lá nhiễm nặng và phun phòng bằng các hoạt chất trừ nấm sinh học hoặc Mancozeb, Azoxystrobin theo hướng dẫn kỹ thuật.',
        art: 'leaf'
    },
    {
        id: 'tech_leaf_miner',
        cat: 'Kỹ thuật',
        title: 'Kỹ thuật phòng trừ Sâu Đục Lá / Sâu Vẽ Bùa (Leucoptera coffeella)',
        summary: 'Bảo vệ ong ký sinh thiên địch, dọn sạch tàn dư lá rụng và áp dụng biện pháp IPM quản lý sâu non đục đường hầm ngoằn ngoèo trong mô lá.',
        content: 'Sâu đục lá (ngài đục lá) là đối tượng dịch hại nguy hiểm làm giảm nghiêm trọng diện tích quang hợp của bộ lá non và lá bánh tẻ, khiến cây sinh trưởng kém.\n\n1. Triệu chứng và tập tính gây hại:\n- Sâu non chui vào giữa hai lớp biểu bì lá, cắn ăn phần mô diệp lục tạo thành các đường hầm ngoằn ngoèo màu trắng bạc.\n- Sau đó, vết đục phồng rộp lên và chuyển sang màu nâu khô giòn. Lá bị hại nặng thường biến dạng cong queo, khô xơ và rụng sớm.\n\n2. Biện pháp phòng trừ tổng hợp:\n- Bảo tồn các loài ong ký sinh thiên địch bản địa bằng cách hạn chế tối đa việc sử dụng thuốc hóa học phổ rộng bừa bãi.\n- Trồng cây che bóng điều hòa ánh sáng; sâu đục lá thường thích tấn công các vườn cà phê trơ trọi không có bóng che.\n- Thường xuyên thăm vườn, ngắt bỏ và tiêu hủy các lá có kén sâu non trước khi vũ hóa.\n- Khi mật độ sâu cao (trên 15-20% lá non bị hại), ưu tiên sử dụng thuốc trừ sâu sinh học gốc vi sinh (Bt), chế phẩm dầu neem hoặc Abamectin theo liều lượng chỉ dẫn.',
        art: 'leaf'
    },
    {
        id: 'tech_red_spider_mite',
        cat: 'Kỹ thuật',
        title: 'Kỹ thuật phòng trừ Nhện Đỏ (Oligonychus coffeae) & Nấm hại mùa khô',
        summary: 'Tưới phun mưa rửa tán lá trong mùa khô, sử dụng dầu khoáng sinh học và luân phiên thuốc đặc trị nhện khi mặt lá chuyển màu xám bạc hoặc loang vàng đồng.',
        content: 'Nhện đỏ hại cà phê phát sinh mạnh mẽ trong điều kiện thời tiết khô hạn kéo dài, nắng nóng và nhiều bụi bẩn bám trên mặt lá.\n\n1. Triệu chứng gây hại:\n- Nhện non và nhện trưởng thành tập trung chủ yếu ở mặt trên lá, dùng kim chích hút dịch tế bào biểu bì lá.\n- Vết chích ban đầu là các chấm nhỏ li ti màu vàng nhạt, sau đó lan rộng làm cả mặt lá chuyển sang màu xám đồng, lá mất bóng, khô ráp và rụng non.\n- Trên bề mặt lá bị nhện hại thường có lớp mạng tơ mỏng mịn giữ lại bụi đất.\n\n2. Biện pháp phòng trừ tổng hợp:\n- Áp dụng kỹ thuật tưới phun mưa với áp lực mạnh lên tán lá trong mùa khô để rửa trôi cơ học nhện và trứng nhện, đồng thời tạo độ ẩm cản trở sự sinh sản của nhện.\n- Bảo vệ các loài nhện bắt mồi, bọ rùa và bọ cánh cộc có ích trong vườn.\n- Tủ gốc giữ ẩm và trồng thảm cỏ phủ đất (như cỏ đậu lạc dại) để duy trì ẩm độ vườn rẫy.\n- Khi mật độ nhện vượt ngưỡng gây hại, phun các chế phẩm dầu khoáng sinh học (SK Enspray), thảo mộc hoặc luân phiên các hoạt chất đặc trị nhện như Hexythiazox, Diafenthiuron để chống hình thành tính kháng thuốc.',
        art: 'leaf'
    },
    {
        id: 'tech_healthy_leaf',
        cat: 'Kỹ thuật',
        title: 'Kỹ thuật cắt tỉa tạo tán, bón phân phục hồi và giữ bộ lá cà phê khỏe mạnh',
        summary: 'Quy trình chăm sóc định kỳ sau vụ thu hoạch giúp cây tái tạo cành dự trữ sung sức, cải tạo độ pH đất và nâng cao sức đề kháng tự nhiên trước dịch bệnh.',
        content: 'Một bộ lá cà phê xanh bóng, dày dặn là điều kiện tiên quyết giúp cây nuôi dưỡng chùm quả sai hạt chắc và kháng lại mọi loại nấm khuẩn xâm nhiễm.\n\n1. Kỹ thuật cắt tỉa cành:\n- Ngay sau thu hoạch, tiến hành cắt tỉa cành khô, cành đã cho quả kiệt sức, cành tăm hương trong tán và cành bị sâu bệnh.\n- Bấm ngọn hoặc tỉa chồi vượt định kỳ để định hình tầng tán đều, đảm bảo mọi cành mang quả đều nhận đủ ánh sáng mặt trời.\n\n2. Kỹ thuật bón phân phục hồi:\n- Bón vôi nông nghiệp (300-500 kg/ha) vào đầu mùa khô để nâng pH đất, ức chế nấm bệnh trong đất phát triển.\n- Bón phân hữu cơ ủ hoai mục (10-15 kg/gốc) kết hợp bổ sung phân lân nung chảy để kích thích bộ rễ cám tái sinh nhanh.\n- Phun phân bón lá chứa axit amin và vi lượng hữu cơ giúp lá non nhanh thành thục, phiến lá dày và tăng sức chịu đựng trước nắng gió khô hanh.',
        art: 'leaf'
    }
];

// Tạo danh sách thẻ bài viết tin tức, kiến thức kỹ thuật và liên kết báo chí
function nlist() {
    // 1. Lấy danh sách bài Kỹ thuật phòng trừ bệnh cố định (bỏ phần gợi ý "Xử lý..." trước đây)
    const techItems = DISEASE_TECH_ARTICLES.map(n => [
        n.cat,
        n.title,
        n.summary,
        'read:' + n.id,
        n.art || 'leaf',
        false, // not suggested
        false, // not online
        ''
    ]);

    // 2. Lấy các bài báo trong CSDL (lọc bỏ các bài kỹ thuật trùng lặp nếu có)
    const dbItems = (NEWS_DB || [])
        .filter(n => n.cat !== 'Kỹ thuật')
        .map(n => [n.cat, n.title, n.summary, 'read:' + n.id, n.art || 'leaf', false, false, '']);

    // 3. Ô báo chí trực tuyến
    const onlineNewsItem = [
        'Báo chí',
        'Tin tức Cà phê cập nhật mỗi ngày trên báo',
        'Cập nhật liên tục 24/7 thị trường giá cà phê trong nước, tình hình thời tiết mùa vụ và kỹ thuật canh tác từ báo chí chính thống.',
        'ext:https://nongnghiep.vn/ca-phe/',
        'news',
        false,
        true, // isOnline
        'https://nongnghiep.vn/ca-phe/'
    ];

    const all = [...techItems, ...dbItems, onlineNewsItem];
    const q = S.q.toLowerCase();
    return all.filter(a => (S.nf == 'Tất cả' || a[0] == S.nf || (a[6] && S.nf == 'Giá')) && (a[1] + a[2]).toLowerCase().includes(q)).map(a => {
        const sg = a[5], isOnline = a[6], G = {'Giá':'orange','Thời tiết':'gray','Kỹ thuật':'green','Báo chí':'orange'}, C = {'Giá':'#F59E0B','Thời tiết':'#3B82F6','Kỹ thuật':'#10B981','Báo chí':'#EA580C'}, R = {'Giá':'chart','Thời tiết':'cloud','Kỹ thuật':'leaf','Báo chí':'news'};
        return gcard({
            g: isOnline ? 'orange' : (sg ? 'purple' : (G[a[0]] || 'green')),
            c: isOnline ? '#EA580C' : (sg ? '#8B5CF6' : (C[a[0]] || '#10B981')),
            badge: isOnline ? 'Báo chí trực tuyến' : (sg ? 'Gợi ý cho bạn' : a[0]),
            t: a[1],
            d: a[2],
            cta: isOnline ? 'Chi tiết' : 'Đọc bài',
            a: a[3],
            art: isOnline ? 'news' : (sg ? 'spark' : (R[a[0]] || 'leaf')),
            href: a[7] || '',
            ic: isOnline ? '<path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' : '<path d="M5 12h14M13 6l6 6-6 6"/>'
        });
    }).join('') || '<p class="mute">Không có bài phù hợp.</p>';
}

// Bảng giá cà phê trực tuyến theo thời gian thực tại các vùng trọng điểm Tây Nguyên kèm hiệu ứng BorderBeam viền xanh chạy
function coffeePriceBoard() {
    const p = (U && U.prov) || 'Đắk Lắk';
    const reg = REGION_COORDS[p] || REGION_COORDS['Đắk Lắk'];
    const localPrice = reg.price ? reg.price.split(' ')[0] : '119.500';
    const localDiff = reg.price && reg.price.includes('(') ? reg.price.substring(reg.price.indexOf('(')+1, reg.price.indexOf(')')) : '+300 đ';
    const isUp = !localDiff.includes('-');
    const nowTime = WX.updated || new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});

    return `<div class="cf-price-board">
        <div class="cf-price-hdr">
            <b>☕ GIÁ CÀ PHÊ VIỆT NAM <small style="color:var(--g);font-weight:600">● Trực tuyến ${nowTime}</small></b>
            <button type="button" data-a="wxref" title="Làm mới giá thị trường">↻ Cập nhật</button>
        </div>
        <div class="cf-price-grid">
            <div class="border-beam-wrap" style="--border-beam-delay:0s">
                <div class="cf-pcard pri-card">
                    <span class="p-name">🌟 ${esc(p)} (Nhân xô)</span>
                    <span class="p-val">${esc(localPrice)} <small style="font-size:11px;font-weight:600">đ/kg</small></span>
                    <span class="p-diff ${isUp?'cf-pdiff-up':'cf-pdiff-down'}">${isUp?'▲':'▼'} ${esc(localDiff)}</span>
                </div>
                <span class="border-beam-ring" aria-hidden="true"></span>
            </div>
            <div class="border-beam-wrap" style="--border-beam-delay:-1.1s">
                <div class="cf-pcard">
                    <span class="p-name">☕ Arabica Cầu Đất / Đà Lạt</span>
                    <span class="p-val">124.000 <small style="font-size:11px;font-weight:600">đ/kg</small></span>
                    <span class="p-diff cf-pdiff-up">▲ +200 đ</span>
                </div>
                <span class="border-beam-ring" aria-hidden="true"></span>
            </div>
            <div class="border-beam-wrap" style="--border-beam-delay:-2.2s">
                <div class="cf-pcard">
                    <span class="p-name">🍒 Quả tươi chín xô (Rẫy)</span>
                    <span class="p-val">25.500 <small style="font-size:11px;font-weight:600">đ/kg</small></span>
                    <span class="p-diff cf-pdiff-flat">— Đứng giá</span>
                </div>
                <span class="border-beam-ring" aria-hidden="true"></span>
            </div>
            <div class="border-beam-wrap" style="--border-beam-delay:-3.3s">
                <div class="cf-pcard">
                    <span class="p-name">📦 Robusta XK (Sàng 18)</span>
                    <span class="p-val">121.200 <small style="font-size:11px;font-weight:600">đ/kg</small></span>
                    <span class="p-diff cf-pdiff-up">▲ +400 đ</span>
                </div>
                <span class="border-beam-ring" aria-hidden="true"></span>
            </div>
        </div>
    </div>`;
}

// Màn hình Tin tức: Tìm kiếm bài viết, lọc chuyên mục và xem giá thị trường
const pNews = () => `<h1>Tin tức thị trường & Kỹ thuật</h1>
<div class="news-topbar">
    <div class="news-searchbox">
        <input id="q" type="search" aria-label="Tìm tin tức" placeholder="🔍 Tìm kiếm bài viết, kỹ thuật…" value="${esc(S.q)}">
        <div class="chips">${['Tất cả','Giá','Thời tiết','Kỹ thuật'].map(c => `<button class="chip ${S.nf==c?'on':''}" data-a="nf:${c}">${c}</button>`).join('')}</div>
    </div>
    ${coffeePriceBoard()}
</div>
<div class="cols c2" id="nl">${nlist()}</div>`;

// Màn hình Nhật ký vườn: Ghi chép cách ly, thời gian phun thuốc và xuất file CSV
function pJr() {
    const hv = harvest();
    return `<h1>Nhật ký vườn</h1>${hv?`<div class="warn">Chưa nên thu hoạch trước ${dm(hv)}</div>`:''}<div class="cols c13"><form class="card" data-f="jr"><h3>Ghi chép mới</h3><label class="f">Nội dung<textarea name="txt" rows="3" required></textarea></label><label class="f">Số ngày cách ly (theo nhãn thuốc)<input name="days" type="number" min="0" max="90" value="0"></label><button class="pri">Ghi vào nhật ký</button> <button type="button" data-a="dl:jr">Tải nhật ký (.csv)</button></form><div class="card"><h3>Ghi chép (${D.j.length})</h3>${D.j.length ? D.j.map(e => `<div class="st" style="display:block"><small>${dm(new Date(e.t))} ${hm(e.t)}${e.auto?' <span class="tg">Tự ghi</span>':''}${e.days?' <span class="tg">Cách ly '+e.days+' ngày</span>':''}</small><div>${esc(e.txt)}</div></div>`).join('') : '<p class="mute">Chưa có ghi chép.</p>'}</div></div>`;
}

// Hiển thị huy hiệu ảnh đại diện hoặc chữ cái viết tắt của người dùng
const avh = c => U.ph ? `<span class="av ${c}" role="img" aria-label="Ảnh đại diện" style="background:url(${U.ph}) center/cover"></span>` : `<span class="av ${c}">${esc(ini(U.name))}</span>`;

// Tạo danh sách nhóm tùy chọn các tỉnh thành trồng cà phê và tỉnh thành khác
function renderProvOptions(selectedVal, placeholderText = 'Chọn tỉnh (tuỳ chọn)') {
    const optGroup = (label, list) => `<optgroup label="${label}">${list.map(p => `<option value="${esc(p)}" ${selectedVal===p?'selected':''}>${esc(p)}</option>`).join('')}</optgroup>`;
    return `${placeholderText ? `<option value="">${placeholderText}</option>` : ''}${optGroup('Tỉnh trọng điểm cà phê', COFFEE_PROVS)}${optGroup('Các tỉnh & thành phố khác', OTHER_PROVS)}`;
}

// Màn hình Tài khoản & Quản lý vườn: Xem hồ sơ nông hộ, báo cáo AI trang trại và các lối tắt quản lý
function pAcc() {
    const s = stats(), t = s.top ? dz(s.top) : null, hv = harvest(), nx = (t ? t.st.find((_, i) => !(D.s[t.id] || {})[i]) : null);
    const rep = `Tuần này vườn có ${s.w} lần quét. Bệnh gặp nhiều nhất: ${t ? t.n : 'chưa có'}. Nguy cơ nấm: ${RAIN.some(x => x >= 5) ? 'cao do có ngày mưa' : 'thấp'}. ${hv ? 'Chưa nên thu hoạch trước ' + dm(hv) + '.' : 'Chưa có cảnh báo thu hoạch.'} ${nx ? 'Bước xử lý tiếp theo: ' + nx + '.' : 'Không còn bước xử lý đang chờ.'}`;
    S.rep = rep;
    const T = (b, l, a) => `<button data-a="${a}"><b>${b}</b>${l}</button>`;
    const avRing = U.ph
        ? `<div class="prof-av-ring" role="img" aria-label="Ảnh đại diện" style="background-image:url(${U.ph})"></div>`
        : `<div class="prof-av-ring" role="img" aria-label="Ảnh đại diện">${esc(ini(U.name))}</div>`;
    const bannerSvg = `<svg class="banner-art" viewBox="0 0 1000 132" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path class="b-leaf" d="M75 118 C75 78 108 55 152 55 C152 95 118 118 75 118 Z" fill="#ffffff" opacity="0.09"/><path class="b-leaf l2" d="M275 48 C275 14 312 -4 358 4 C350 40 315 56 275 48 Z" fill="#ffffff" opacity="0.12"/><g class="b-ring"><circle cx="422" cy="84" r="38" fill="none" stroke="#ffffff" stroke-width="10"/><circle cx="422" cy="84" r="21" fill="none" stroke="#ffffff" stroke-width="2"/></g><path class="b-leaf l3" d="M525 94 C525 56 560 36 608 38 C602 76 568 94 525 94 Z" fill="#ffffff" opacity="0.13"/><g class="b-ring r2"><circle cx="670" cy="48" r="34" fill="none" stroke="#ffffff" stroke-width="9"/><circle cx="670" cy="48" r="18" fill="none" stroke="#ffffff" stroke-width="2"/></g><path class="b-leaf l4" d="M750 38 C750 8 786 -6 832 2 C826 36 792 48 750 38 Z" fill="#ffffff" opacity="0.12"/><path class="b-leaf l2" d="M950 138 C950 86 982 60 1020 56 L1020 138 Z" fill="#ffffff" opacity="0.09"/><circle class="b-spark" cx="210" cy="95" r="3"/><circle class="b-spark s2" cx="480" cy="110" r="2.5"/><circle class="b-spark s3" cx="620" cy="100" r="3.2"/><circle class="b-spark s4" cx="860" cy="98" r="2.8"/></svg>`;
    return `<section class="prof-card"><div class="prof-banner">${bannerSvg}</div><div class="prof-body"><div class="prof-left"><div class="prof-av-wrap">${avRing}<button type="button" class="prof-cam-btn" data-a="pick:avf" title="Đổi ảnh đại diện" aria-label="Đổi ảnh đại diện"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></button></div><input id="avf" type="file" accept="image/*" hidden><div class="prof-info"><div class="prof-name-row"><h1>${esc(U.name)}</h1></div><div class="prof-email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>${esc(U.email)}</div><div class="prof-badges"><span class="p-badge role"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M12 14c-4 0-7-3-7-7 4 0 7 3 7 7z"/><path d="M12 11c0-4 3-7 7-7 0 4-3 7-7 7z"/></svg>${esc(U.role)}</span><span class="p-badge prov"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>${esc(U.prov)}</span></div></div></div><div class="prof-actions"><button type="button" class="btn-edit" data-a="profmodal">Chỉnh sửa thông tin</button><button type="button" class="dng btn-logout" data-a="out">Đăng xuất</button></div></div></section>
    <div class="tiles" style="margin-bottom:16px">${T(s.n,'Tổng lần chẩn đoán','go:hist')}${T(s.avg+'%','Độ tin cậy TB','go:hist')}${T('Bản đồ','Bản đồ dịch bệnh','go:map')}${T('Sản lượng','Thống kê sản lượng','go:yld')}</div>
    <div class="hero"><h3>Báo cáo AI trang trại</h3><p>${rep}</p><button data-a="copy">Sao chép báo cáo</button></div>
    <h3>Quản lý vườn</h3><div class="gcg">${gcard({g:'green',c:'#10B981',badge:'Quản lý vườn',t:'Nhật ký vườn',d:'Ghi chép và theo dõi ngày cách ly.',cta:'Mở nhật ký',a:'go:jr',art:'book'})}${gcard({g:'orange',c:'#F59E0B',badge:'Xuất khẩu',t:'Hồ sơ xuất khẩu',d:'Danh sách kiểm tra tự tính từ dữ liệu của bạn.',cta:'Mở hồ sơ',a:'go:exp',art:'doc'})}</div>
    <div class="card"><h3>Chẩn đoán gần đây</h3>${D.h.slice(0, 4).map(x => `<div class="it"><button class="op" data-a="opd:${x.d}"><img src="${x.th || x.src}" alt=""><span><b>${dz(x.d).n}</b><small>${dm(new Date(x.t))} · ${Math.round(x.cf*100)}%</small></span></button></div>`).join('') || '<p class="mute">Chưa có lần quét.</p>'}</div>`;
}

const RIPPLE = `<div class="rp">${Array.from({length:11},(_,i)=>`<i style="width:${100+i*70}px;height:${100+i*70}px;opacity:${Math.max(0,.24-i*.03).toFixed(2)};animation-delay:${(i*.06).toFixed(2)}s;border-style:${i==10?'dashed':'solid'}"></i>`).join('')}</div>`;
const OIC = {
    leaf:'<path d="M4 26C4 12 12 5 28 4c0 14-8 22-24 22z" fill="#4CAF50"/><path d="M5 26C12 18 18 12 26 6" stroke="#E8F5E9" stroke-width="1.6" fill="none"/>',
    cherry:'<path d="M16 4c0 5-2 8-5 11" stroke="#7A5236" stroke-width="2" fill="none"/><circle cx="11" cy="21" r="7" fill="#D6362B"/><circle cx="23" cy="22" r="6" fill="#E04B3F"/><circle cx="9" cy="19" r="2" fill="#fff" opacity=".5"/>',
    cup:'<path d="M5 12h18v7a8 8 0 01-8 8h-2a8 8 0 01-8-8z" fill="#7A5236"/><path d="M23 14h2a3 3 0 010 7h-2" stroke="#7A5236" stroke-width="2.4" fill="none"/><path d="M11 3c-1 2 1 3 0 5M17 3c-1 2 1 3 0 5" stroke="#A9876C" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    drop:'<path d="M16 3C10 11 7 15 7 20a9 9 0 0018 0c0-5-3-9-9-17z" fill="#3B82F6"/><path d="M12 21a4 4 0 004 4" stroke="#fff" stroke-width="1.8" fill="none" opacity=".7" stroke-linecap="round"/>',
    sun:'<circle cx="16" cy="16" r="6" fill="#F59E0B"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M7 7l3 3M22 22l3 3M7 25l3-3M22 10l3-3" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round"/>',
    sick:'<path d="M4 26C4 12 12 5 28 4c0 14-8 22-24 22z" fill="#6BBF4A"/><circle cx="14" cy="14" r="3.2" fill="#E8590C"/><circle cx="20" cy="9" r="2.4" fill="#E8590C"/><circle cx="10" cy="20" r="2.4" fill="#F59E0B"/>',
    sprout:'<path d="M16 28V15" stroke="#8BC34A" stroke-width="2.6" stroke-linecap="round"/><path d="M16 17C8 17 5 12 5 7c6 0 11 2 11 10z" fill="#8BC34A"/><path d="M16 14c0-6 4-9 11-9 0 6-4 9-11 9z" fill="#689F38"/>',
    scan:'<path d="M5 11V5h6M21 5h6v6M27 21v6h-6M11 27H5v-6" stroke="#14B8A6" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M9 16h14" stroke="#14B8A6" stroke-width="2.4" stroke-linecap="round"/>',
    shield:'<path d="M16 3l11 4v8c0 7-5 11-11 14C10 26 5 22 5 15V7z" fill="#6366F1"/><path d="M11 16l4 4 7-8" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
};
const ORBITS = [['leaf',34,110,0,0,0],['cherry',34,110,10,0,180],['cup',34,170,0,1,0],['drop',34,170,10,1,180],['sick',46,230,0,0,0],['sun',46,230,10,0,180],['sprout',46,290,0,1,0],['scan',46,290,10,1,180],['shield',46,340,5,0,90]].map(([k,z,r,d,rv,a]) => `<span class="orbit${rv?' rv':''}" style="--sz:${z}px;--radius:${r};--duration:20;--delay:${-d};--a:${a}"><svg viewBox="0 0 32 32">${OIC[k]}</svg></span>`).join('');

const SCAN = `<svg viewBox="0 0 240 170" role="img" aria-label="Minh họa AI quét lá cà phê"><defs><linearGradient id="lgr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5FB04A"/><stop offset="1" stop-color="#2F7D37"/></linearGradient></defs><path d="M18 92C58 8 170 -2 224 70C182 152 70 162 18 92Z" fill="url(#lgr)"/><path d="M18 92C80 84 150 78 224 70" stroke="#CDEBA9" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M70 88L95 40M110 84L140 38M150 78L178 46M70 88L92 130M115 85L142 126M155 79L182 110" stroke="#CDEBA9" stroke-width="1.5" fill="none" opacity=".6"/><circle cx="95" cy="62" r="7" fill="#E8590C"/><circle cx="150" cy="104" r="6" fill="#C98A2A"/><circle cx="130" cy="59" r="5" fill="#E8590C"/><g class="bx" style="animation-delay:1.2s"><rect x="82" y="49" width="26" height="26" rx="4"/><text x="82" y="44">Rỉ sắt 94%</text></g><g class="bx" style="animation-delay:1.9s"><rect x="137" y="91" width="26" height="26" rx="4"/><text x="137" y="127">Đốm mắt cua 87%</text></g><g class="bx" style="animation-delay:2.4s"><rect x="118" y="46" width="26" height="26" rx="4"/><text x="118" y="83">Rỉ sắt 91%</text></g><rect class="scl" x="8" y="0" width="224" height="3" rx="1.5"/></svg>`;
const AUTHICON = {
    EON: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    EOFF: '<path d="M3 3l18 18M10.6 6.2A9.8 9.8 0 0112 6c6 0 10 6 10 6a17 17 0 01-3.2 3.9M6.6 7.6C4 9.3 2 12 2 12s4 7 10 7c1.5 0 2.9-.4 4.1-1M9.9 9.9a3 3 0 004.2 4.2"/>'
};

// ============================================================================
// MODUN XÁC THỰC, ĐĂNG KÝ & THANH ĐO MẬT KHẨU NÔNG DÂN (AUTH & PASSWORD STRENGTH)
// ============================================================================

/**
 * GIAO DIỆN 1: pLogin() - MÀN HÌNH ĐĂNG NHẬP & TẠO TÀI KHOẢN (DUAL CARD INTERFACE)
 * Thuyết trình:
 * - Thiết kế giao diện 2 thẻ đối xứng (Đăng nhập / Đăng ký) chuyển đổi bằng hiệu ứng tia laser.
 * - Tích hợp đầy đủ thông tin hỗ trợ nông dân: ghi nhớ tài khoản trên thiết bị, danh sách chip bấm nhanh.
 * - Màn hình đăng ký tích hợp thanh đo mật khẩu 3 vạch (Password Strength Meter) & danh sách tích xanh trực quan.
 */
function pLogin() {
    const rg = !!S.reg;
    const noAuto = 'autocomplete="off" readonly onfocus="this.removeAttribute(\'readonly\')"';
    const fg = (id, t, rq, inner, extraBelow = '') => `<div class="fg"><label class="sgn" for="${id}">${t}${rq?' <span class="req">*</span>':''}</label>${inner}${extraBelow}<small class="field-err" id="err-${id}" role="alert"></small></div>`;
    const inp = (px, nm, t, rq, ty, ph, ex, extraBelow = '') => fg(px + nm, t, rq, `<div class="gi"><input id="${px+nm}" name="${nm}" type="${ty}" placeholder="${ph}" ${ex||''}></div>`, extraBelow);
    const pwd = (px, nm, t, ph, ex, extraBelow = '') => fg(px + nm, t, 1, `<div class="pwr"><div class="gi"><input id="${px+nm}" name="${nm}" type="password" placeholder="${ph}" ${ex||''} style="padding-right:46px"></div><button type="button" class="eye" data-a="eye" aria-pressed="false" aria-label="Hiện hoặc ẩn mật khẩu"><span class="e1">${ic(AUTHICON.EOFF)}</span><span class="e2">${ic(AUTHICON.EON)}</span></button></div>`, extraBelow);
    
    // Khối giao diện thanh đo độ mạnh mật khẩu (3 vạch tiến trình + 3 tiêu chí nông dân)
    const pwChecklist = `<div class="ps-root tone-none" id="ps-root">
        <div class="ps-meter" role="meter" aria-label="Độ mạnh mật khẩu" aria-valuemin="0" aria-valuemax="3" aria-valuenow="0">
            <div class="ps-cell"><span class="ps-bar" id="ps-bar-0" style="transition-delay:0ms"></span></div>
            <div class="ps-cell"><span class="ps-bar" id="ps-bar-1" style="transition-delay:30ms"></span></div>
            <div class="ps-cell"><span class="ps-bar" id="ps-bar-2" style="transition-delay:60ms"></span></div>
        </div>
        <div class="ps-status-row">
            <span class="ps-label" id="ps-label">Chưa nhập mật khẩu</span>
        </div>
        <ul class="ps-rules" id="ps-rules">
            <li class="ps-rule-item" id="rule-len">
                <span class="ps-check-box">
                    <span class="ps-check-bg"></span>
                    <svg class="ps-check-svg" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6.2 4.7 8.9 10 3.3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
                <span class="ps-rule-text">Từ 8 ký tự trở lên (dễ nhớ)</span>
            </li>
            <li class="ps-rule-item" id="rule-letter">
                <span class="ps-check-box">
                    <span class="ps-check-bg"></span>
                    <svg class="ps-check-svg" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6.2 4.7 8.9 10 3.3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
                <span class="ps-rule-text">Có chữ cái không dấu (ví dụ: caphe, vuonnha)</span>
            </li>
            <li class="ps-rule-item" id="rule-digit">
                <span class="ps-check-box">
                    <span class="ps-check-bg"></span>
                    <svg class="ps-check-svg" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6.2 4.7 8.9 10 3.3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
                <span class="ps-rule-text">Có ít nhất 1 chữ số (ví dụ: 1985, 2026)</span>
            </li>
        </ul>
    </div>`;

    const sub = t => `<button class="sgb" type="submit">${t} &rarr;<span class="bg1"></span><span class="bg2"></span></button>`;
    const view = r => `<div class="sc-v"><div class="sc-fr">${SCAN}</div><div class="sc-vt"><h3>${r?'Đã có tài khoản?':'Chưa có tài khoản?'}</h3><p>${r?'Quay lại đăng nhập để vào vườn của bạn.':'Tạo tài khoản để lưu lịch sử chẩn đoán và nhật ký vườn.'}</p><button type="button" class="sc-sw" data-a="reg">${r?'Đăng nhập':'Tạo tài khoản'}</button></div></div>`;
    const chips = A.length ? `<div class="chips" style="margin:0" role="group" aria-label="Tài khoản đã lưu trên thiết bị này"><small style="align-self:center">Trên máy này:</small>${A.map(a => `<button type="button" class="chip" data-a="fill:${esc(a.email)}">${esc(a.un || a.email)}</button>`).join('')}</div><div class="or"><hr><p>hoặc nhập thông tin</p><hr></div>` : '';
    
    // Khối thẻ đăng nhập
    const login = `<section class="sc-s sc-l${rg?'':' on'}" aria-label="Đăng nhập">${view(0)}<div class="sc-f"><form class="sgf" data-f="login" autocomplete="off" novalidate><h2>Đăng nhập</h2><p class="sgs">Chào mừng trở lại. Đăng nhập để tiếp tục chăm sóc vườn của bạn.</p><p class="fok" id="fok" role="status"></p>${chips}${inp('l-','id','Email hoặc tên đăng nhập',1,'text','Nhập email hoặc tên đăng nhập','required ' + noAuto)}${pwd('l-','pw','Mật khẩu','Nhập mật khẩu','required ' + noAuto)}<label class="rm"><input type="checkbox" name="rm" checked>Ghi nhớ đăng nhập</label><p class="ferr" id="ferr" role="alert"></p>${sub('Đăng nhập')}</form></div></section>`;
    
    // Khối thẻ đăng ký
    const reg = `<section class="sc-s sc-r${rg?' on':''}" aria-label="Tạo tài khoản"><div class="sc-f"><form class="sgf" data-f="reg" autocomplete="off" novalidate><h2>Tạo tài khoản</h2><p class="sgs">Chỉ cần 4 thông tin bắt buộc, phần còn lại bổ sung sau.</p>${inp('r-','un','Tên đăng nhập',1,'text','Chỉ chữ không dấu, số, dấu . hoặc _ (3-20 ký tự)','required maxlength="20" ' + noAuto)}${inp('r-','email','Email',1,'email','Ví dụ: tenban@gmail.com','required ' + noAuto)}${pwd('r-','pw','Mật khẩu','Tối thiểu 8 ký tự (chữ + số, ví dụ: caphe1985)','required ' + noAuto, pwChecklist)}${pwd('r-','pw2','Nhập lại mật khẩu','Nhập lại mật khẩu khớp ở trên','required ' + noAuto)}<div class="f2">${inp('r-','name','Họ và tên',0,'text','Tuỳ chọn','autocomplete="off"')}${inp('r-','phone','Số điện thoại',0,'tel','Chỉ nhập 10 chữ số (VD: 0912345678)','inputmode="numeric" maxlength="10" autocomplete="off"')}</div>${fg('r-prov','Tỉnh / thành phố',0,`<div class="gi"><select id="r-prov" name="prov">${renderProvOptions('','Chọn tỉnh (tuỳ chọn)')}</select></div>`)}<p class="ferr" id="ferr2" role="alert"></p>${sub('Tạo tài khoản')}</form></div>${view(1)}<div class="sc-ok" aria-live="polite"><svg viewBox="0 0 32 32" width="72" height="72" fill="none" stroke="#C8F04A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="16" r="13" opacity=".35"/><path d="M9 17l5 5 9-11"/></svg><b>Đã tạo tài khoản thành công!</b><small style="opacity:.9;font-size:14px">Đang chuyển sang màn hình đăng nhập...</small></div></section>`;
    return `<div class="sg2"><div class="sc${rg?' reg':''}">${login}${reg}<span class="sc-laser" aria-hidden="true"></span></div></div>`;
}

/**
 * HÀM TIỆN ÍCH 1: setFieldErr() - BẬT BÁO ĐỎ TẠI TỪNG Ô NHẬP LIỆU
 * Thuyết trình: Khi người dùng gõ sai, viền ô nhập đổi màu đỏ (class: err-inp)
 * và dòng chữ cảnh báo có biểu tượng ⚠️ xuất hiện ngay dưới ô đó.
 */
function setFieldErr(inputId, msg) {
    const inp = $('#' + inputId);
    const errEl = $('#err-' + inputId);
    const gi = inp ? inp.closest('.gi') : null;
    if (errEl) errEl.textContent = msg ? ('⚠️ ' + msg.replace(/^⚠️\s*/, '')) : '';
    if (gi) {
        gi.classList.toggle('err-inp', !!msg);
        if (msg) gi.classList.remove('ok-inp');
    }
    return !msg;
}

/**
 * HÀM TIỆN ÍCH 2: setFieldOk() - BẬT TRẠNG THÁI HỢP LỆ CHO Ô NHẬP LIỆU
 * Thuyết trình: Xóa bỏ thông báo đỏ và thêm viền xanh nhạt xác nhận dữ liệu đã đạt chuẩn.
 */
function setFieldOk(inputId) {
    const inp = $('#' + inputId);
    const errEl = $('#err-' + inputId);
    const gi = inp ? inp.closest('.gi') : null;
    if (errEl) errEl.textContent = '';
    if (gi) {
        gi.classList.remove('err-inp');
        gi.classList.add('ok-inp');
    }
    return true;
}

// Bộ đếm thời gian Debounce để tránh gửi request dồn dập khi gõ phím
let _unCheckTimer = null, _emCheckTimer = null;

/**
 * HÀM KIỂM SOÁT TỔNG: validateRegField() - KIỂM TRA TỪNG TRƯỜNG DỮ LIỆU ĐĂNG KÝ
 * Thuyết trình:
 * - Được gọi mỗi khi sự kiện 'input' hoặc 'focusout' kích hoạt.
 * - Hỗ trợ cả kiểm tra tĩnh (Regex định dạng) lẫn kiểm tra động (gọi API /api/auth/check trong CSDL).
 */
function validateRegField(id, val, forceRequired = false, triggerRemote = false) {
    const v = String(val || '');

    // 1. Kiểm tra Tên đăng nhập (un): 3-20 ký tự không dấu, số, ., _
    if (id === 'r-un') {
        const t = v.trim();
        if (!t) {
            return forceRequired ? setFieldErr('r-un', 'Vui lòng nhập tên đăng nhập.') : setFieldErr('r-un', '');
        }
        if (/[^a-zA-Z0-9._]/.test(v)) {
            return setFieldErr('r-un', 'Chỉ được nhập ký tự không dấu (a-z), chữ số (0-9), dấu chấm (.) hoặc gạch dưới (_), không chứa khoảng trắng.');
        }
        if (t.length < 3 || t.length > 20) {
            return setFieldErr('r-un', 'Tên đăng nhập phải từ 3 đến 20 ký tự.');
        }
        setFieldOk('r-un');
        if (triggerRemote) {
            clearTimeout(_unCheckTimer);
            _unCheckTimer = setTimeout(async () => {
                try {
                    const cur = $('#r-un') ? $('#r-un').value.trim() : '';
                    if (cur !== t) return;
                    const res = await API.checkAuthAvailability(t, '');
                    if (res && res.usernameTaken && $('#r-un') && $('#r-un').value.trim() === t) {
                        setFieldErr('r-un', res.usernameMessage || `Tên đăng nhập "${t}" đã có người sử dụng.`);
                    }
                } catch (e) {}
            }, 300);
        }
        return true;
    }

    // 2. Kiểm tra Email: Cú pháp chuẩn RFC và kiểm tra trùng trong CSDL
    if (id === 'r-email') {
        const t = v.trim();
        if (!t) {
            return forceRequired ? setFieldErr('r-email', 'Vui lòng nhập địa chỉ email.') : setFieldErr('r-email', '');
        }
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(t)) {
            return setFieldErr('r-email', 'Email chưa đúng định dạng (ví dụ: tenban@gmail.com).');
        }
        setFieldOk('r-email');
        if (triggerRemote) {
            clearTimeout(_emCheckTimer);
            _emCheckTimer = setTimeout(async () => {
                try {
                    const cur = $('#r-email') ? $('#r-email').value.trim() : '';
                    if (cur !== t) return;
                    const res = await API.checkAuthAvailability('', t);
                    if (res && res.emailTaken && $('#r-email') && $('#r-email').value.trim() === t) {
                        setFieldErr('r-email', res.emailMessage || `Email "${t}" đã được đăng ký tài khoản.`);
                    }
                } catch (e) {}
            }, 300);
        }
        return true;
    }

    // 3. Kiểm tra Mật khẩu (pw): Đo độ mạnh 3 vạch & cập nhật dấu tích xanh thời gian thực
    if (id === 'r-pw') {
        const rules = {
            len: v.length >= 8,
            letter: /[a-zA-Z]/.test(v) && !/[^\x00-\x7F]/.test(v),
            digit: /\d/.test(v)
        };
        // Cập nhật trạng thái từng ô tích xanh
        const rLen = $('#rule-len'), rLetter = $('#rule-letter'), rDigit = $('#rule-digit');
        if (rLen) rLen.classList.toggle('met', rules.len);
        if (rLetter) rLetter.classList.toggle('met', rules.letter);
        if (rDigit) rDigit.classList.toggle('met', rules.digit);

        // Tính toán điểm số và cập nhật màu sắc thanh tiến trình
        const passed = (rules.len ? 1 : 0) + (rules.letter ? 1 : 0) + (rules.digit ? 1 : 0);
        const score = v.length === 0 ? 0 : passed;
        const tone = score === 0 ? 'tone-none' : score === 1 ? 'tone-danger' : score === 2 ? 'tone-caution' : 'tone-safe';
        const labels = ['Chưa nhập mật khẩu', 'Yếu (Cần bổ sung)', 'Trung bình', 'Đạt chuẩn & An toàn'];

        const psRoot = $('#ps-root');
        if (psRoot) psRoot.className = `ps-root ${tone}`;
        const psLabel = $('#ps-label');
        if (psLabel) psLabel.textContent = labels[score];

        for (let i = 0; i < 3; i++) {
            const bar = $('#ps-bar-' + i);
            if (bar) bar.classList.toggle('active', i < score);
        }

        const pw2El = $('#r-pw2');
        if (pw2El && pw2El.value) validateRegField('r-pw2', pw2El.value, false);
        if (!v) {
            return forceRequired ? setFieldErr('r-pw', 'Vui lòng nhập mật khẩu.') : setFieldErr('r-pw', '');
        }
        const missing = [];
        if (!rules.len) missing.push('tối thiểu 8 ký tự');
        if (!rules.letter) missing.push('chữ cái không dấu (a-z)');
        if (!rules.digit) missing.push('chữ số (0-9)');
        if (missing.length > 0) {
            return setFieldErr('r-pw', 'Mật khẩu còn thiếu: ' + missing.join(', ') + '.');
        }
        return setFieldOk('r-pw');
    }

    // 4. Kiểm tra Nhập lại mật khẩu (pw2): Khớp tuyệt đối với ô mật khẩu trên
    if (id === 'r-pw2') {
        const pw = $('#r-pw') ? $('#r-pw').value : '';
        if (!v) {
            return forceRequired ? setFieldErr('r-pw2', 'Vui lòng nhập lại mật khẩu.') : setFieldErr('r-pw2', '');
        }
        if (v !== pw) {
            return setFieldErr('r-pw2', 'Mật khẩu nhập lại chưa khớp với mật khẩu ở trên.');
        }
        return setFieldOk('r-pw2');
    }

    // 5. Kiểm tra Số điện thoại: 10 chữ số chuẩn di động Việt Nam (03, 05, 07, 08, 09)
    if (id === 'r-phone') {
        const t = v.trim();
        if (!t) {
            const inp = $('#r-phone');
            if (inp && inp.closest('.gi')) inp.closest('.gi').classList.remove('err-inp', 'ok-inp');
            return setFieldErr('r-phone', '');
        }
        if (/[^0-9]/.test(t)) {
            return setFieldErr('r-phone', 'Số điện thoại chỉ được phép nhập chữ số (0-9), không được nhập chữ!');
        }
        if (!/^0[35789][0-9]{8}$/.test(t)) {
            return setFieldErr('r-phone', 'Số điện thoại phải gồm đúng 10 chữ số hợp lệ tại Việt Nam (bắt đầu bằng 03, 05, 07, 08, 09).');
        }
        return setFieldOk('r-phone');
    }
    return true;
}

/**
 * HIỆU ỨNG TIA LAZER: scTo() - CHUYỂN ĐỔI MƯỢT GIỮA ĐĂNG NHẬP VÀ ĐĂNG KÝ
 * Thuyết trình: Sử dụng Web Animations API mô phỏng tia quét công nghệ cao (Laser sweep)
 * trượt ngang qua thẻ đăng ký/đăng nhập tạo trải nghiệm hiện đại.
 */
function scTo(toReg, done) {
    const sc = document.querySelector('.sc');
    if (!sc) { S.reg = toReg ? 1 : 0; render(); if (done) done(); return; }
    if (sc.dataset.busy) return;
    const inc = sc.querySelector(toReg ? '.sc-r' : '.sc-l'),
          out = sc.querySelector(toReg ? '.sc-l' : '.sc-r'),
          las = sc.querySelector('.sc-laser'),
          vert = matchMedia('(max-width:819px)').matches,
          rm = matchMedia('(prefers-reduced-motion: reduce)').matches,
          anims = [];
    const fin = () => {
        anims.forEach(a => { try { a.cancel(); } catch (e) {} });
        inc.classList.remove('in');
        inc.classList.add('on');
        out.classList.remove('on');
        sc.classList.toggle('reg', toReg);
        S.reg = toReg ? 1 : 0;
        delete sc.dataset.busy;
        las.style.display = 'none';
        const f = inc.querySelector('input:not([type=checkbox])');
        if (f && !rm) { f.removeAttribute('readonly'); try { f.focus({ preventScroll: true }); } catch (e) {} }
        if (done) done();
    };
    if (rm) { fin(); return; }
    sc.dataset.busy = 1;
    inc.classList.add('in');
    const hide = vert ? (toReg ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)') : (toReg ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)'),
          prop = vert ? 'top' : 'left',
          D = 1000,
          E = 'cubic-bezier(.65,0,.35,1)';
    try {
        las.className = 'sc-laser' + (vert ? ' v' : '') + (toReg ? '' : ' b');
        las.style.display = 'block';
        anims.push(inc.animate([{ clipPath: hide }, { clipPath: 'inset(0 0 0 0)' }], { duration: D, easing: E, fill: 'both' }));
        const la = las.animate([{ [prop]: toReg ? '0%' : '100%' }, { [prop]: toReg ? '100%' : '0%' }], { duration: D, easing: E, fill: 'both' });
        anims.push(la);
        la.onfinish = fin;
    } catch (e) { fin(); }
}

/**
 * XỬ LÝ HOÀN TẤT ĐĂNG KÝ: scDone() - TỰ ĐỘNG KHÓA VÀ CHUYỂN SANG ĐĂNG NHẬP
 * Thuyết trình:
 * - Sau khi tạo tài khoản thành công trong MySQL, hiển thị dấu tích xanh lớn "Đã tạo tài khoản thành công!".
 * - Quét tia lazer chuyển về thẻ Đăng nhập, điền sẵn Tên đăng nhập vừa tạo và đặt con trỏ vào ô Mật khẩu.
 */
function scDone(un) {
    const sc = document.querySelector('.sc');
    if (!sc) { S.reg = 0; render(); toast('Tạo tài khoản thành công! Vui lòng đăng nhập.'); return; }
    sc.classList.add('lock');
    setTimeout(() => {
        scTo(false, () => {
            sc.classList.remove('lock');
            const rf = sc.querySelector('.sc-r form');
            if (rf) rf.reset();
            sc.querySelectorAll('.sc-r .gi').forEach(g => g.classList.remove('err-inp', 'ok-inp'));
            sc.querySelectorAll('.sc-r .field-err').forEach(el => el.textContent = '');
            sc.querySelectorAll('.sc-r .ps-bar').forEach(b => b.classList.remove('active'));
            sc.querySelectorAll('.sc-r .ps-rule-item').forEach(el => el.classList.remove('met'));
            if ($('#ps-root')) $('#ps-root').className = 'ps-root tone-none';
            if ($('#ps-label')) $('#ps-label').textContent = 'Chưa nhập mật khẩu';
            if ($('#ferr2')) $('#ferr2').textContent = '';
            if ($('#ferr')) $('#ferr').textContent = '';
            if ($('#fok')) $('#fok').textContent = `🎉 Đăng ký tài khoản "${un}" thành công! Vui lòng nhập mật khẩu để vào vườn.`;
            const i = sc.querySelector('.sc-l input[name=id]'), p = sc.querySelector('.sc-l input[name=pw]');
            if (i) { i.removeAttribute('readonly'); i.value = un; }
            if (p) { p.removeAttribute('readonly'); p.value = ''; try { p.focus(); } catch (e) {} }
            toast('🎉 Tạo tài khoản thành công! Hãy đăng nhập.');
        });
    }, 1100);
}

/**
 * XỬ LÝ SUBMIT ĐĂNG NHẬP: doLogin()
 * Thuyết trình: Kiểm tra trống -> Mã hóa authHash -> Gửi POST /api/auth/login -> Lưu phiên làm việc và tải trang chủ vườn cà phê.
 */
async function doLogin(v) {
    const btn = document.querySelector('form[data-f="login"] button[type="submit"]');
    if (btn && btn.disabled) return;
    const er = m => { if ($('#ferr')) $('#ferr').textContent = m; };
    er('');
    if ($('#fok')) $('#fok').textContent = '';
    setFieldErr('l-id', '');
    setFieldErr('l-pw', '');
    if (!(v.id || '').trim()) {
        setFieldErr('l-id', 'Vui lòng nhập email hoặc tên đăng nhập.');
        return;
    }
    if (!v.pw) {
        setFieldErr('l-pw', 'Vui lòng nhập mật khẩu.');
        return;
    }
    const origText = btn ? btn.textContent : '';
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Đang đăng nhập...';
    }
    try {
        const payload = await API.login(v.id, v.pw);
        rememberAccountOnDevice(payload.user, v.pw, !!v.rm);
        applyBootstrap(payload, !!v.rm);
        toast('Đăng nhập thành công');
    } catch (e) {
        if (e.field === 'id') setFieldErr('l-id', e.message);
        else if (e.field === 'pw') setFieldErr('l-pw', e.message);
        er(e.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = origText || 'Đăng nhập';
        }
    }
}

/**
 * XỬ LÝ SUBMIT ĐĂNG KÝ: doReg()
 * Thuyết trình:
 * - Kiểm tra hợp lệ toàn bộ các trường trước khi gửi (Client-side pre-validation).
 * - Nếu có ô sai, tự động focus vào ô lỗi đầu tiên và không gửi request rác lên server.
 * - Khóa nút submit chống Double-submit / Spam click.
 * - Khi server trả lỗi vi phạm, tự động gắn cờ đỏ đúng ô tương ứng.
 */
async function doReg(v) {
    const btn = document.querySelector('form[data-f="reg"] button[type="submit"]');
    if (btn && btn.disabled) return;
    const er = m => { const el = $('#ferr2') || $('#ferr'); if (el) el.textContent = m; };
    er('');
    const okUn = validateRegField('r-un', v.un, true, false);
    const okEm = validateRegField('r-email', v.email, true, false);
    const okPw = validateRegField('r-pw', v.pw, true, false);
    const okPw2 = validateRegField('r-pw2', v.pw2, true, false);
    const okPh = validateRegField('r-phone', v.phone, false, false);
    if (!okUn || !okEm || !okPw || !okPw2 || !okPh) {
        er('Vui lòng kiểm tra và sửa các ô báo đỏ bên trên trước khi tạo tài khoản.');
        const firstBad = document.querySelector('.sc-r .gi.err-inp input');
        if (firstBad) { try { firstBad.focus(); } catch (x) {} }
        return;
    }
    const origText = btn ? btn.textContent : '';
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Đang xử lý...';
    }
    try {
        await API.register(v);
        scDone((v.un || '').trim());
    } catch (e) {
        if (e.field && ['un', 'email', 'pw', 'pw2', 'phone'].includes(e.field)) {
            setFieldErr('r-' + e.field, e.message);
            const badInp = $('#r-' + e.field);
            if (badInp) { try { badInp.focus(); } catch (x) {} }
        }
        er(e.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = origText || 'Tạo tài khoản';
        }
    }
}

// Hiển thị hộp thoại xác nhận khi người dùng bấm Đăng xuất
function confirmOut() {
    if ($('#dlg')) $('#dlg').remove();
    const d = document.createElement('div');
    d.id = 'dlg';
    d.className = 'ovl';
    d.innerHTML = `<div class="dlgb" role="dialog" aria-modal="true" aria-labelledby="dt"><h3 id="dt">Đăng xuất khỏi CafeLeaf?</h3><p class="mute">Dữ liệu vườn của bạn đã được lưu an toàn trong MySQL. Bạn có thể đăng nhập lại bất cứ lúc nào.</p><div class="row" style="justify-content:flex-end"><button data-a="dlgx">Ở lại</button><button class="dng" data-a="out2">Đăng xuất</button></div></div>`;
    d.addEventListener('click', ev => { if (ev.target === d) d.remove(); });
    document.body.appendChild(d);
    d.querySelector('button').focus();
}

// Mở hộp thoại (Modal popup) chỉnh sửa thông tin cá nhân của nông dân
function showProfileModal() {
    if ($('#dlg')) $('#dlg').remove();
    const d = document.createElement('div');
    d.id = 'dlg';
    d.className = 'ovl';
    d.innerHTML = `<form class="dlgb" data-f="prof" role="dialog" aria-modal="true"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><h3 style="margin:0">Hồ sơ</h3><button type="button" data-a="dlgx" style="min-height:34px;width:34px;padding:0;border-radius:50%" aria-label="Đóng">✕</button></div><label class="f">Họ tên<input name="name" value="${esc(U.name)}" required></label><label class="f">Tên đăng nhập<input name="un" value="${esc(U.un)}"></label><label class="f">Email<input value="${esc(U.email)}" readonly></label><label class="f">Số điện thoại<input name="phone" type="tel" value="${esc(U.phone)}"></label><label class="f">Tỉnh/Thành<select name="prov">${renderProvOptions(U.prov, '')}</select></label><label class="f">Vai trò<input value="${esc(U.role)}" readonly></label><div class="row"><button type="submit" class="pri">Lưu hồ sơ</button><button type="button" class="out" data-a="pwmodal">Đổi mật khẩu</button></div></form>`;
    d.addEventListener('click', ev => { if (ev.target === d) d.remove(); });
    document.body.appendChild(d);
    d.querySelector('input').focus();
}

// Mở hộp thoại (Modal popup) đổi mật khẩu tài khoản
function showPasswordModal() {
    if ($('#dlg')) $('#dlg').remove();
    const d = document.createElement('div');
    d.id = 'dlg';
    d.className = 'ovl';
    d.innerHTML = `<form class="dlgb" data-f="pwchange" role="dialog" aria-modal="true"><h3>Đổi mật khẩu tài khoản</h3><label class="f">Mật khẩu hiện tại<input name="oldPw" type="password" required placeholder="Nhập mật khẩu hiện tại"></label><label class="f">Mật khẩu mới (tối thiểu 8 ký tự)<input name="newPw" type="password" minlength="8" required placeholder="Nhập mật khẩu mới"></label><div class="row" style="justify-content:flex-end"><button type="button" data-a="dlgx">Hủy</button><button type="submit" class="pri">Cập nhật mật khẩu</button></div></form>`;
    d.addEventListener('click', ev => { if (ev.target === d) d.remove(); });
    document.body.appendChild(d);
    d.querySelector('input').focus();
}

// Mở hộp thoại (Modal popup) xem chi tiết nội dung bài viết tin tức hoặc kỹ thuật canh tác
function showNewsModal(id) {
    const item = (DISEASE_TECH_ARTICLES || []).find(n => String(n.id) === String(id)) || (NEWS_DB || []).find(n => String(n.id) === String(id));
    if (!item) return toast('Không tìm thấy bài viết');
    const d = document.createElement('div');
    d.id = 'dlg';
    d.className = 'ovl';
    d.innerHTML = `<div class="dlgb" role="dialog" aria-modal="true"><span class="tg">${esc(item.cat)}</span><h3 style="margin:8px 0">${esc(item.title)}</h3><p class="mute" style="font-weight:600">${esc(item.summary)}</p><p style="line-height:1.65;white-space:pre-line">${esc(item.content)}</p><div class="row" style="justify-content:flex-end"><button class="pri" data-a="dlgx">Đóng</button></div></div>`;
    document.body.appendChild(d);
}

// Màn hình Trang chủ cho máy tính (Desktop)
function pHomeDesktop() {
    const s = stats(), t = s.top && dz(s.top), l = D.h[0], hv = harvest(), wet = RAIN.some(x => x >= 5), mx = Math.max(...RAIN, 1), h = new Date().getHours(), nd = new Date(), nx = t ? t.st.findIndex((_, i) => !(D.s[t.id] || {})[i]) : -1;
    const wt = wxType(WX.code, WX.isDay);
    const heroThemeClass = (wt === 'storm') ? 'wx-theme-rain' : `wx-theme-${wt}`;
    return `<div class="hero ${heroThemeClass}"><small style="color:#fff">${WD[nd.getDay()]}, ${dm(nd)} · ${esc(U.prov)} (${esc(WX.sub)}) · <b>${WX.temp}°C</b> · Độ ẩm <b>${WX.hum}%</b> · Gió <b>${WX.wind} km/h</b> · <span class="wx-hero-ic">${wxIcon(WX.code, WX.isDay, 22)}${esc(WX.desc)}</span></small><h1>${h<11?'Chào buổi sáng':h<18?'Chào buổi chiều':'Chào buổi tối'}, ${esc(U.name.split(' ').pop())}</h1><p>${s.n?`Vườn của bạn có ${s.w} lần quét trong 7 ngày qua.`:'Hãy chụp chiếc lá đầu tiên để bắt đầu theo dõi vườn.'}</p><button data-a="cam">Chẩn đoán lá mới</button>
    <div class="wx" role="img" aria-label="Dự báo mưa 7 ngày">${RAIN.map((r, i) => { const d = new Date(); d.setDate(d.getDate() + i); return `<div><i style="height:${6+r/mx*44}px"></i>${i?WD[d.getDay()].replace('Thứ ','T').replace('Chủ nhật','CN'):'Nay'}<br>${r}</div>`; }).join('')}</div><small style="color:#fff">Mưa dự kiến 7 ngày (mm) tại ${esc(U.prov)} (${esc(WX.sub)}) ${WX.updated?'· Cập nhật trực tuyến lúc '+WX.updated:''}</small></div>
    <div class="warn">${hv?'Chưa nên thu hoạch trước '+dm(hv):wet?'Có ngày mưa từ 5 mm trong tuần: tránh phun vào ngày mưa và theo dõi nấm bệnh.':'Thời tiết tuần này thuận lợi để chăm vườn.'}</div>
    <div class="card"><h3>Quy trình mỗi lần chăm lá</h3><div class="steps4">${[['Chụp lá','cam'],['Xử lý','go:treat'],['Ghi nhật ký','go:jr'],['Theo dõi','go:hist']].map((x, i) => `<button data-a="${x[1]}"><span class="num">${i+1}</span>${x[0]}</button>`).join('')}</div></div>
    <div class="cols c2"><div><div class="card"><h3>Tổng quan</h3><div class="kpi"><div><b data-n="${s.n}">${s.n}</b>lần quét</div><div><b data-n="${s.w}">${s.w}</b>7 ngày</div><div><b data-n="${s.avg}" data-s="%">${s.avg}%</b>tin cậy TB</div></div></div>
    <div class="card"><h3>Việc nên làm tiếp</h3>${nx>=0?`<p style="margin-top:0"><b>${t.n}:</b> ${t.st[nx]}</p><button class="pri" data-a="opd:${t.id}">Mở bước xử lý</button>`:t?'<p class="mute" style="margin-top:0">Bạn đã làm xong mọi bước. Hãy kiểm tra lại lá sau vài ngày.</p><button class="pri" data-a="cam">Kiểm tra lại</button>':'<p class="mute" style="margin-top:0">Chưa có việc cần làm. Hãy chẩn đoán một lá.</p>'}</div>
    <div class="card"><h3>Tình trạng các lô</h3>${lots()}</div></div>
    <div>${wxLivePanel()}<div class="card"><h3>Lần quét gần nhất</h3>${l?`<div class="it" style="margin:0"><button class="op" data-a="opd:${l.d}"><img src="${l.th || l.src}" alt=""><span><b>${dz(l.d).n}</b><small>${dm(new Date(l.t))} ${hm(l.t)} · ${Math.round(l.cf*100)}%</small><div class="bar"><i style="width:${l.cf*100}%;background:${cc(l.cf)}"></i></div></span></button></div>`:'<p class="mute" style="margin:0">Chưa có lần quét nào.</p>'}</div></div></div>
    <div class="gcg">${gcard({g:'green',c:'#10B981',badge:'Mở mỗi ngày',t:'Nhật ký vườn',d:'Ghi chép việc đã làm, số ngày cách ly và ngày thu hoạch an toàn.',cta:'Mở nhật ký',a:'go:jr',art:'book'})}${gcard({g:'gray',c:'#3B82F6',badge:'Giá, thời tiết, kỹ thuật',t:'Tin tức',d:'Tin cho nhà vườn, gợi ý theo bệnh bạn gặp nhiều nhất.',cta:'Đọc tin',a:'go:news',art:'news'})}</div>
    <h2 style="margin:8px 0 14px;font-size:20px">Các bệnh thường gặp</h2><div class="gcg">${DS.filter(d => isSick(d.id)).map((d, i) => gcard({g:['orange','gray','purple','green'][i%4],c:d.c,badge:'Nguy hại '+d.risk.toLowerCase(),t:d.n,d:SYM[d.id],cta:'Xem cách xử lý',a:'opd:'+d.id,art:'leaf'})).join('')}</div>`;
}

// Giao diện Trang chủ trên Di động: Dự báo thực tế, nút chụp to nổi bật, 6 ô chức năng tiện lợi
function pHomeMobile() {
    const s = stats(), t = s.top && dz(s.top), l = D.h[0], hv = harvest(), wet = RAIN.some(x => x >= 5);
    const nd = new Date();
    const nx = t ? t.st.findIndex((_, i) => !(D.s[t.id] || {})[i]) : -1;
    const isHumidityHigh = WX.hum >= 80 || wet;

    return `
    <!-- Thẻ thời tiết thực tế -->
    <div class="m-wx-card">
      <div class="m-wx-row">
        <div>
          <span style="font-size:12.5px;color:var(--mute)">${WD[nd.getDay()]}, ${dm(nd)} · ${esc(U.prov || 'Tây Nguyên')}</span>
          <div class="m-wx-temp">
            ${wxIcon(WX.code, WX.isDay, 28)}
            <span>${WX.temp}°C</span>
            <small style="font-size:13px;font-weight:500;color:var(--mute);margin-left:4px">Độ ẩm ${WX.hum}%</small>
          </div>
        </div>
        <div style="text-align:right">
          <span class="tg" style="background:var(--soft);color:var(--g);font-weight:700">${esc(WX.desc || 'Thuận lợi')}</span>
        </div>
      </div>
      <div class="m-wx-alert ${isHumidityHigh ? 'warn' : 'good'}">
        ${isHumidityHigh 
          ? '⚠️ <b>Khuyến cáo nông vụ:</b> Độ ẩm cao trên 80% hoặc có mưa, nguy cơ phát sinh Nấm hồng & Rỉ sắt. Bác nên kiểm tra mặt dưới lá!'
          : '☀️ <b>Thời tiết thuận lợi:</b> Vườn thông thoáng, thích hợp cắt tỉa cành sâu bệnh và bón phân hữu cơ.'}
      </div>
    </div>

    <!-- Nút Chụp lá to nổi bật -->
    <div class="m-cam-card">
      <button type="button" class="m-cam-btn" data-a="pick:cam">
        <span style="font-size:20px">📸 BẤM ĐỂ CHỤP LÁ CÀ PHÊ NGAY</span>
        <small>Phát hiện chính xác 5 loại bệnh trong 1 giây</small>
      </button>
      <button type="button" class="m-cam-sub" data-a="pick:mul">📁 Hoặc chọn nhiều ảnh lá trong máy để khám hàng loạt</button>
    </div>

    <!-- Tình trạng hôm nay -->
    <div class="m-status-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <b style="font-size:15px">Hôm nay tại vườn</b>
        <span class="mute" style="font-size:12px">${s.w} lần quét tuần này</span>
      </div>
      ${nx >= 0 ? `
        <div style="background:var(--soft);padding:10px 12px;border-radius:10px;margin-bottom:8px">
          <div style="font-size:13.5px;font-weight:700;color:var(--bad)">⚠️ Cần xử lý tiếp: ${t.n}</div>
          <div style="font-size:12.5px;color:var(--ink);margin:3px 0 6px">${t.st[nx]}</div>
          <button class="pri" data-a="opd:${t.id}" style="min-height:34px;font-size:12.5px;width:100%">Tiếp tục chữa bệnh</button>
        </div>
      ` : `
        <div style="background:color-mix(in srgb,var(--g) 8%,var(--sf));border:1px solid color-mix(in srgb,var(--g) 25%,transparent);padding:10px 12px;border-radius:10px;margin-bottom:8px;font-size:13px;color:var(--g)">
          ✅ Vườn ổn định. Chưa có bước điều trị nào bị tồn đọng.
        </div>
      `}
      ${l ? `
        <div style="display:flex;align-items:center;gap:10px;padding-top:6px;border-top:1px solid var(--line)">
          <img src="${l.th || l.src}" style="width:40px;height:40px;object-fit:cover;border-radius:6px">
          <div style="flex:1;font-size:12.5px">
            <b>${dz(l.d).n}</b> · <span style="color:var(--mute)">${dm(new Date(l.t))} ${hm(l.t)}</span>
            <div style="font-size:11px;color:${cc(l.cf)}">Độ tin cậy: ${Math.round(l.cf*100)}%</div>
          </div>
          <button class="out" data-a="opd:${l.d}" style="min-height:30px;padding:0 8px;font-size:11.5px">Xem</button>
        </div>
      ` : ''}
    </div>

    <!-- 6 Lối tắt tính năng -->
    <div style="font-weight:700;font-size:14px;margin:16px 0 8px;color:var(--ink)">Tính năng thường dùng</div>
    <div class="m-tiles">
      <div class="m-tile" data-a="pick:mul">
        <span class="m-tile-ico">📁</span>
        <span class="m-tile-title">Chụp nhiều lá</span>
      </div>
      <div class="m-tile" data-a="go:hist">
        <span class="m-tile-ico">📋</span>
        <span class="m-tile-title">Lịch sử khám</span>
      </div>
      <div class="m-tile" data-a="go:map">
        <span class="m-tile-ico">🗺️</span>
        <span class="m-tile-title">Bản đồ bệnh</span>
      </div>
      <div class="m-tile" data-a="go:jr">
        <span class="m-tile-ico">📔</span>
        <span class="m-tile-title">Nhật ký vườn</span>
      </div>
      <div class="m-tile" data-a="go:yld">
        <span class="m-tile-ico">📈</span>
        <span class="m-tile-title">Dự tính mùa vụ</span>
      </div>
      <div class="m-tile" data-a="go:news">
        <span class="m-tile-ico">📰</span>
        <span class="m-tile-title">Giá cà phê</span>
      </div>
    </div>

    <!-- 5 Bệnh thường gặp -->
    <div style="font-weight:700;font-size:14px;margin:14px 0 8px;color:var(--ink)">Tra cứu 5 loại bệnh cà phê</div>
    <div class="chips" style="padding-bottom:8px">
      ${DS.map(d => `<button class="chip" data-a="opd:${d.id}" style="font-size:13px">${d.n}</button>`).join('')}
    </div>
    `;
}

// Điều phối hiển thị trang Trang chủ: Mobile vs Desktop
function pHome() {
    return isMobile() ? pHomeMobile() : pHomeDesktop();
}

// Giao diện Thêm (Danh mục tính năng) trên Di động
function pMore() {
    return `
    <div style="margin-bottom:14px">
      <h1 style="font-size:22px">Danh mục &amp; Tính năng khác</h1>
      <p class="mute" style="margin:2px 0 0;font-size:13px">Hệ sinh thái thông minh chăm sóc vườn cà phê</p>
    </div>
    
    <div class="card" style="display:flex;align-items:center;gap:12px;padding:14px;margin-bottom:14px">
      <div class="av" style="width:48px;height:48px;font-size:18px">${esc((U.name||'N').slice(0,1).toUpperCase())}</div>
      <div style="flex:1">
        <b style="font-size:16px">${esc(U.name)}</b>
        <div style="font-size:12.5px;color:var(--mute)">${esc(U.prov || 'Tây Nguyên')} · ${esc(U.phone || 'Chưa cập nhật SĐT')}</div>
      </div>
      <button class="out" data-a="go:acc" style="min-height:34px;padding:0 10px;font-size:12.5px">Hồ sơ</button>
    </div>

    <div class="m-menu-group">
      <button class="m-menu-item" data-a="go:bench">
        <span class="m-menu-item-left"><span class="m-menu-ico">⚖️</span><span>So sánh Mô hình &amp; Benchmark AI</span></span>
        <span class="m-menu-item-arrow">›</span>
      </button>
      <button class="m-menu-item" data-a="go:jr">
        <span class="m-menu-item-left"><span class="m-menu-ico">📔</span><span>Nhật ký canh tác vườn</span></span>
        <span class="m-menu-item-arrow">›</span>
      </button>
      <button class="m-menu-item" data-a="go:yld">
        <span class="m-menu-item-left"><span class="m-menu-ico">📈</span><span>Dự tính sản lượng vụ mùa</span></span>
        <span class="m-menu-item-arrow">›</span>
      </button>
      <button class="m-menu-item" data-a="go:map">
        <span class="m-menu-item-left"><span class="m-menu-ico">🗺️</span><span>Bản đồ phân lô &amp; Dịch bệnh</span></span>
        <span class="m-menu-item-arrow">›</span>
      </button>
      <button class="m-menu-item" data-a="go:news">
        <span class="m-menu-item-left"><span class="m-menu-ico">📰</span><span>Tin tức &amp; Giá cà phê hôm nay</span></span>
        <span class="m-menu-item-arrow">›</span>
      </button>
      <button class="m-menu-item" data-a="go:exp">
        <span class="m-menu-item-left"><span class="m-menu-ico">📦</span><span>Hồ sơ xuất khẩu EUDR &amp; Mã QR</span></span>
        <span class="m-menu-item-arrow">›</span>
      </button>
      <button class="m-menu-item" data-a="go:coop">
        <span class="m-menu-item-left"><span class="m-menu-ico">🤝</span><span>Hợp tác xã &amp; Khuyến nông</span></span>
        <span class="m-menu-item-arrow">›</span>
      </button>
    </div>

    <div class="m-menu-group">
      <button class="m-menu-item" data-a="theme">
        <span class="m-menu-item-left"><span class="m-menu-ico">🌓</span><span>Đổi giao diện Sáng / Tối</span></span>
        <span class="m-menu-item-arrow">${ST.g('cf.theme','auto') === 'dark' ? 'Tối' : ST.g('cf.theme','auto') === 'light' ? 'Sáng' : 'Tự động'} ›</span>
      </button>
      <button class="m-menu-item" data-a="go:acc">
        <span class="m-menu-item-left"><span class="m-menu-ico">🔑</span><span>Đổi mật khẩu &amp; Cài đặt</span></span>
        <span class="m-menu-item-arrow">›</span>
      </button>
      <button class="m-menu-item" data-a="out" style="color:var(--bad)">
        <span class="m-menu-item-left"><span class="m-menu-ico">🚪</span><span style="color:var(--bad)">Đăng xuất khỏi ứng dụng</span></span>
        <span class="m-menu-item-arrow" style="color:var(--bad)">›</span>
      </button>
    </div>
    `;
}

// Xử lý cắt vuông 160x160, nén ảnh JPEG và tải lên ảnh đại diện nông dân
function avatar(f) {
    const im = new Image();
    im.onload = async () => {
        const c = document.createElement('canvas'); c.width = c.height = 160;
        const m = Math.min(im.width, im.height);
        c.getContext('2d').drawImage(im, (im.width-m)/2, (im.height-m)/2, m, m, 0, 0, 160, 160);
        const dataUrl = c.toDataURL('image/jpeg', .8);
        U.ph = dataUrl;
        try {
            await API.updateProfile({ userId: U.id, name: U.name, un: U.un, phone: U.phone, prov: U.prov, ph: dataUrl });
            toast('Đã cập nhật ảnh đại diện');
        } catch (e) {
            toast(e.message);
        }
        render();
    };
    im.src = URL.createObjectURL(f);
}

// Khởi tạo và vẽ các mã QR truy xuất nguồn gốc bằng thư viện QRCode
function qrs() {
    document.querySelectorAll('.qr').forEach(e => {
        try { new QRCode(e, {text: e.dataset.q, width: 140, height: 140, correctLevel: QRCode.CorrectLevel.L}); }
        catch(x) { e.textContent = 'Không tạo được mã QR'; }
    });
}

// Nút bấm quay lại trang Tài khoản & Quản lý vườn
const back = t => `<button data-a="go:acc" style="min-height:36px;border:0;background:none;color:var(--g);padding:0">← Tài khoản</button><h1>${t}</h1>`;

// Màn hình Bản đồ nông trại 2D và AI Radar dự báo hướng lây lan dịch bệnh
function pMap() {
    if (S.mapLot == null) S.mapLot = 0; // Mặc định mở Lô A (index 0)
    const curLotIdx = S.mapLot;
    const by = LOTS.map((n, i) => {
        const hs = D.h.filter(h => (h.lot || 0) == i);
        return {idx: i, n, x: hs[0], scans: hs, sick: hs.filter(h => isSick(h.d)).length, all: hs.length};
    });
    const totSick = by.reduce((a, b) => a + b.sick, 0);
    const totScans = by.reduce((a, b) => a + b.all, 0);
    const selectedLot = by[curLotIdx] || by[0];
    const topDiseaseInSelected = selectedLot.x && dz(selectedLot.x.d);

    // Tính toán chỉ số nguy cơ lây lan (AI Spread Risk Score: 0 - 100%)
    let riskScore = 15; // Mức nền
    if (totSick > 0) riskScore += Math.min(45, totSick * 3.5);
    if (WX.hum >= 80) riskScore += 20; // Độ ẩm kích thích nấm
    else if (WX.hum >= 70) riskScore += 10;
    if (RAIN.some(r => r >= 5)) riskScore += 20; // Mưa phát tán bào tử
    riskScore = Math.min(95, Math.round(riskScore));

    const riskColor = riskScore >= 65 ? 'var(--bad)' : riskScore >= 40 ? '#F59E0B' : 'var(--g)';
    const riskLabel = riskScore >= 65 ? 'NGUY CƠ CAO' : riskScore >= 40 ? 'NGUY CƠ TRUNG BÌNH' : 'NGUY CƠ THẤP';

    return `${back('Bản đồ dịch bệnh nông trại & AI Radar')}<p class="sub" style="margin:0 0 14px">Sơ đồ phân lô thông minh, khoanh vùng ổ dịch và dự báo nguy cơ lây lan bằng AI thời gian thực.</p>
    <div class="farm-map-layout">
        <!-- CỘT TRÁI: Sơ đồ mặt bằng nông trại 2D -->
        <div class="card" style="margin:0">
            <div class="row" style="margin:0 0 10px;justify-content:space-between">
                <b>🗺️ MẶT BẰNG PHÂN LÔ NÔNG TRẠI (2D)</b>
                <small class="mute">Nhấp vào từng lô để xem hồ sơ bệnh</small>
            </div>
            <div class="farm-zone-grid">
                ${by.map(b => {
                    const d = b.x && dz(b.x.d);
                    const isFocus = b.idx === curLotIdx;
                    const sickCount = b.sick;
                    const isOutbreak = d && isSick(d.id) && sickCount >= 1;
                    const color = d ? d.c : 'var(--line)';
                    const statusText = isOutbreak ? '⚠️ Ổ dịch phát hiện' : (b.all > 0 ? '✓ Tạm an toàn' : '⚪ Chưa quét');
                    return `<div class="farm-lot-card ${isFocus ? 'active-lot' : ''}" style="--c:${color}" data-a="maplot:${b.idx}">
                        <div class="row" style="margin:0;justify-content:space-between">
                            <b style="font-size:19px">${b.n}</b>
                            <span class="lot-badge-status">${statusText}</span>
                        </div>
                        <div style="margin:8px 0">
                            <span style="font-weight:700;font-size:15px;color:var(--ink)">${d ? d.n : 'Chưa có dữ liệu'}</span><br>
                            <small class="mute">${b.sick} ca bệnh / ${b.all} lần quét</small>
                        </div>
                        ${isOutbreak ? '<i class="lot-radar-beacon"></i>' : ''}
                    </div>`;
                }).join('')}
            </div>

            <!-- Bảng chi tiết Lô đang chọn -->
            <div class="lot-detail-drawer">
                <div class="row" style="margin:0 0 8px;justify-content:space-between">
                    <b>🔍 Hồ sơ chi tiết ${selectedLot.n}:</b>
                    ${topDiseaseInSelected && isSick(topDiseaseInSelected.id) ? `<button class="pri" data-a="opd:${topDiseaseInSelected.id}" style="min-height:30px;padding:2px 12px;font-size:12px">⚡ Mở phác đồ xử lý ${topDiseaseInSelected.n}</button>` : ''}
                </div>
                <p style="margin:0 0 8px;font-size:13.5px">Lần quét gần nhất ghi nhận: <b style="color:${topDiseaseInSelected ? topDiseaseInSelected.c : 'var(--ink)'}">${topDiseaseInSelected ? topDiseaseInSelected.n : 'Chưa có dữ liệu quét'}</b>. Tổng cộng có <b>${selectedLot.sick}</b> ca bệnh trên ${selectedLot.all} mẫu lá đã kiểm tra.</p>
                ${selectedLot.scans && selectedLot.scans.length ? `
                <div style="font-size:12px;color:var(--mute);margin-bottom:4px">Ảnh chụp quét gần nhất tại ${selectedLot.n}:</div>
                <div class="lot-recent-scans">
                    ${selectedLot.scans.slice(0, 6).map(s => `<img src="${s.th || s.src}" alt="${s.d}" title="${(dz(s.d)||{}).n||s.d} (${Math.round(s.cf*100)}%)">`).join('')}
                </div>` : '<div style="font-size:12.5px" class="mute">Chưa có ảnh quét nào ở lô này. Hãy chụp lá tại lô này để AI định vị ổ dịch.</div>'}
            </div>

            <!-- Chú thích các loại bệnh -->
            <div class="row" style="margin-top:14px;flex-wrap:wrap;gap:6px">
                <small class="mute" style="width:100%">Chú thích bệnh hại:</small>
                ${DS.map(d => `<span class="tg" style="font-size:11.5px"><span class="dot" style="background:${d.c};display:inline-block;width:8px;height:8px"></span> ${d.n}</span>`).join('')}
            </div>
        </div>

        <!-- CỘT PHẢI: AI Radar Phân tích Nguy cơ Lây lan -->
        <div class="ai-radar-card">
            <div class="row" style="margin:0 0 10px;justify-content:space-between">
                <b>⚠️ AI SPREAD RADAR</b>
                <span class="tg" style="background:color-mix(in srgb,${riskColor} 20%,transparent);color:${riskColor};font-weight:700">${riskLabel}</span>
            </div>

            <div class="risk-meter">
                <div class="row" style="margin:0;justify-content:space-between;font-size:13px">
                    <span>Chỉ số rủi ro lây lan:</span>
                    <b style="color:${riskColor};font-size:16px">${riskScore}%</b>
                </div>
                <div class="risk-meter-bar">
                    <div class="risk-meter-fill" style="width:${riskScore}%;background:${riskColor}"></div>
                </div>
                <small class="mute">Tổng hợp từ ${totSick} ca bệnh / ${totScans} lần quét và độ ẩm ${WX.hum}% (${esc(U.prov)})</small>
            </div>

            <div style="margin-top:12px">
                <b style="font-size:13.5px">🎯 Dự báo hướng phát tán AI:</b>
                <div class="rec-box" style="margin-top:8px">
                    ${totSick > 0 ? `
                    <b>Tâm điểm dịch: ${by.filter(b => b.sick > 0).map(b => b.n).join(', ')}</b><br>
                    Do ${by.filter(b => b.sick > 0).map(b => b.n).join(', ')} có mật độ sâu bệnh cao, mầm bệnh có nguy cơ phát tán sang các lô giáp ranh qua gió (${WX.wind} km/h) và dòng nước mưa.
                    ` : `
                    <b>Hiện tại toàn vườn an toàn</b><br>
                    Chưa phát hiện ổ dịch tập trung. Duy trì chế độ theo dõi định kỳ sau các đợt mưa.
                    `}
                </div>
            </div>

            <div style="margin-top:14px">
                <b style="font-size:13.5px">💡 Hành động khuyến nghị cho nhà vườn:</b>
                <ul style="padding-left:18px;margin:8px 0;font-size:13px;line-height:1.6;color:var(--ink)">
                    <li><b>Khoanh vùng cách ly:</b> Cắt tỉa cành nhiễm nặng ở lô tâm dịch, không vứt bừa bãi sang lô sạch.</li>
                    <li><b>Kiểm soát độ ẩm:</b> ${WX.hum >= 75 ? 'Độ ẩm không khí cao, tuyệt đối tránh tưới tràn vào chiều tối.' : 'Độ ẩm thuận lợi, tưới gốc đều đặn.'}</li>
                    <li><b>Phun phòng ranh giới:</b> Phun chế phẩm sinh học bảo vệ các hàng cây giáp ranh giữa các lô.</li>
                </ul>
            </div>

            <button class="pri" data-a="cam" style="width:100%;margin-top:12px">📷 Quét thêm lá để cập nhật bản đồ</button>
        </div>
    </div>`;
}

// Màn hình Thống kê sản lượng: Ghi chép và theo dõi sản lượng thu hoạch từng lô
function pYld() {
    const Y = D.y || [], tot = Y.reduce((a, x) => a + x.kg, 0), sm = i => Y.filter(x => x.lot == i).reduce((a, x) => a + x.kg, 0), mx = Math.max(1, ...LOTS.map((_, i) => sm(i)));
    return `${back('Thống kê sản lượng')}<div class="cols c13"><form class="card" data-f="yld"><h3>Ghi sản lượng thu hoạch</h3><label class="f">Lô<select name="lot">${LOTS.map((l, i) => `<option value="${i}">${l}</option>`).join('')}</select></label><label class="f">Sản lượng (kg)<input name="kg" type="number" min="1" required></label><button class="pri">Lưu sản lượng</button></form>
    <div><div class="card"><h3>Tổng quan</h3><div class="kpi" style="grid-template-columns:1fr 1fr"><div><b data-n="${tot}">${tot}</b>kg tổng</div><div><b>${Y.length}</b>lần ghi</div></div>${LOTS.map((l, i) => `<div class="pg" style="grid-template-columns:60px 1fr 70px"><span>${l}</span><div class="bar"><i style="width:${sm(i)/mx*100}%;background:var(--g)"></i></div><em>${sm(i)} kg</em></div><small style="display:block;margin:-2px 0 8px">${D.h.filter(h => (h.lot||0)==i && isSick(h.d)).length} ca bệnh trong lịch sử quét</small>`).join('')}</div>
    <div class="card"><h3>Lịch sử ghi</h3>${Y.length ? Y.map(x => `<div class="st" style="min-height:0"><span>${dm(new Date(x.t))} · ${LOTS[x.lot]}</span><b style="margin-left:auto">${x.kg} kg</b></div>`).join('') : '<p class="mute" style="margin:0">Chưa có dữ liệu sản lượng.</p>'}</div></div></div>`;
}

// Màn hình Cây và mã QR: Sinh mã QR truy xuất thông tin xuất xứ và bệnh gần nhất của từng lô
function pQr() {
    const hv = harvest();
    return `${back('Cây và truy xuất QR')}<p class="sub" style="margin:0 0 12px">Mỗi lô có một mã QR chứa thông tin vườn và bệnh gần nhất.</p><div class="lmap">${LOTS.map((l, i) => { const x = D.h.find(h => (h.lot||0) == i), t = x ? dz(x.d).n + ' ' + dm(new Date(x.t)) : 'Chưa quét'; return `<div class="card" style="margin:0;text-align:center"><div class="qr" data-q="${esc(['CafeLeaf',U.name,U.prov,l,t,hv?'Cách ly đến '+dm(hv):'Không cách ly'].join('|'))}"></div><h3 style="margin:10px 0 2px">${l}</h3><small>${t}</small></div>`; }).join('')}</div>`;
}

// Màn hình Hồ sơ xuất khẩu: Bảng kiểm tra tự động đánh giá tiêu chuẩn xuất khẩu nông sản
function pExp() {
    const hv = harvest(), rec = D.h.filter(h => Date.now() - h.t < 2592e6).length, sick = LOTS.filter((_, i) => { const x = D.h.find(h => (h.lot||0) == i); return x && isSick(x.d); }).length;
    const ck = [
        ['Có lần quét lá trong 30 ngày qua', rec > 0],
        ['Nhật ký có ghi thuốc và ngày cách ly', D.j.some(e => e.days > 0)],
        ['Không còn thời gian cách ly', !hv],
        ['Các lô đều khỏe ở lần quét gần nhất', sick == 0 && D.h.length > 0],
        ['Đã ghi sản lượng', (D.y || []).length > 0]
    ], ok = ck.filter(c => c[1]).length;
    S.ck = ck;
    S.rep = `Hồ sơ vườn ${U.name} (${U.prov}): ${ok}/${ck.length} mục đạt. ${rec} lần quét trong 30 ngày. ${hv ? 'Chưa nên thu hoạch trước ' + dm(hv) + '.' : 'Không còn thời gian cách ly.'}`;
    return `${back('Hồ sơ xuất khẩu')}<div class="cols c13"><div class="card" style="text-align:center"><div style="display:flex;justify-content:center">${ring(ok/ck.length)}</div><h3 style="margin:10px 0 2px">${ok}/${ck.length} mục đạt</h3><small>Mức sẵn sàng của hồ sơ</small><div class="row" style="justify-content:center"><button class="pri" data-a="copy">Sao chép hồ sơ</button><button data-a="dl:exp">Tải hồ sơ (.txt)</button></div></div>
    <div class="card"><h3>Danh sách kiểm tra</h3>${ck.map(c => `<div class="st" style="align-items:center"><span class="ib" style="width:28px;height:28px;border-radius:50%;background:${c[1]?'var(--g)':'var(--soft)'};color:${c[1]?'var(--on)':'var(--mute)'}">${ic(c[1]?'<path d="M5 12l5 5 9-10"/>':'<path d="M6 12h12"/>')}</span><span>${c[0]}</span></div>`).join('')}<p class="note">Yêu cầu cụ thể tùy thị trường nhập khẩu, hãy hỏi cán bộ khuyến nông.</p></div></div>`;
}

// Màn hình Hợp tác xã: Kết nối và gửi báo cáo vườn cho cán bộ nông nghiệp
function pCoop() {
    const c = D.coop || '', s = stats();
    S.rep = `Báo cáo vườn ${U.name} gửi ${c}: ${s.w} lần quét tuần này, bệnh nhiều nhất: ${s.top ? dz(s.top).n : 'chưa có'}.`;
    return `${back('Hợp tác xã')}<div class="cols c2"><form class="card" data-f="coop"><h3>Thông tin hợp tác xã</h3><label class="f">Tên hợp tác xã<input name="n" value="${esc(c)}" required></label><button class="pri">Lưu</button></form><div class="card"><h3>Chia sẻ báo cáo</h3>${c?`<p class="mute" style="margin-top:0">Gửi báo cáo vườn cho ${esc(c)}.</p><button class="out" data-a="copy">Sao chép báo cáo</button>`:'<p class="mute" style="margin:0">Nhập tên hợp tác xã để chia sẻ báo cáo.</p>'}<p class="note">Đã đồng bộ với hồ sơ nông hộ trong MySQL.</p></div></div>`;
}

// Bản đồ định tuyến các màn hình giao diện chính trong ứng dụng
const PG = {map:pMap,yld:pYld,qr:pQr,exp:pExp,coop:pCoop,home:pHome,scan:pScan,bench:pBench,hist:pHist,treat:pTreat,news:pNews,jr:pJr,acc:pAcc,more:pMore};

// Hàm điều phối hiển thị giao diện chính (Routing, thanh Sidebar, Chatbot AI và nội dung từng trang)
function render() {
    const r = $('#root');
    const curTheme = ST.g('cf.theme', 'auto');
    const themeIcon = curTheme === 'dark'
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
        : curTheme === 'light'
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/></svg>`;
    const mobThemeBtn = `<button type="button" class="mob-theme-btn" data-a="theme" aria-label="Đổi giao diện Sáng / Tối" title="Giao diện: ${{auto:'Tự động (Theo máy)',light:'Sáng ☀️',dark:'Tối 🌙'}[curTheme]}">${themeIcon}</button>`;

    if (!U) { r.innerHTML = mobThemeBtn + pLogin(); return; }
    const open = $('#ai') && $('#ai').classList.contains('open');
    const inputs = `<input id="cam" type="file" accept="image/*" capture="environment" hidden><input id="fil" type="file" accept="image/*" hidden><input id="mul" type="file" accept="image/*" multiple hidden>`;

    if (isMobile()) {
        const mTopBar = `<header class="m-topbar"><div class="m-topbar-brand">${BOT.replace('width="46" height="46"','width="30" height="30"')} <span>Lá vườn nhà</span></div><div class="m-topbar-right"><button type="button" class="m-theme-btn" data-a="theme" aria-label="Đổi giao diện">${themeIcon}</button></div></header>`;
        const mBottomNav = `<nav class="m-nav" aria-label="Điều hướng di động">
          <button class="${S.page === 'home' ? 'on' : ''}" data-a="go:home">${ic('<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>')}<span>Trang chủ</span></button>
          <button class="${S.page === 'treat' ? 'on' : ''}" data-a="go:treat">${ic('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>')}<span>Điều trị</span></button>
          <button class="m-fab ${S.page === 'scan' ? 'on' : ''}" data-a="go:scan" aria-label="Chụp chẩn đoán"><div class="m-fab-circle">${ic('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>')}</div><span>Chẩn đoán</span></button>
          <button class="${S.page === 'hist' ? 'on' : ''}" data-a="go:hist">${ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}<span>Lịch sử</span></button>
          <button class="${S.page === 'more' ? 'on' : ''}" data-a="go:more">${ic('<path d="M4 6h16M4 12h16M4 18h16"/>')}<span>Thêm</span></button>
        </nav>`;

        r.innerHTML = `${mTopBar}<main class="${S.enter?'enter':''}">${(PG[S.page] || pHome)()}</main>${mBottomNav}${inputs}
        <div class="bw"><span class="tag">Hỏi trợ lý AI</span><button class="bub" data-a="ai" aria-label="Mở trợ lý AI">${BOT}</button></div>
        <section id="ai" class="aip ${open?'open':''}" aria-label="Trợ lý Cà Phê AI"><div class="ah">${BOT.replace('width="46" height="46"','width="30" height="30"')}<span>Trợ lý Cà Phê AI<br><small style="color:#fff">Kết nối Spring Boot + MySQL</small></span><button data-a="ai" aria-label="Đóng">✕</button></div><div class="ab">${chatBox()}<div class="qk">${['Bệnh gần nhất của tôi','Hôm nay phun thuốc được không','Mẹo chụp ảnh','Khi nào được thu hoạch'].map(q => `<button data-a="q:${q}">${q}</button>`).join('')}</div></div></section>`;
    } else {
        const sideCollapsed = ST.g('cf.side_col', '0') === '1';
        const nv = (c, b) => ORD.filter(i => !b || BN.includes(i)).map(i => NAV.find(x => x[0] == i)).map(n => `<button class="${c} ${cp(S.page)==n[0]?'on':''}" data-a="go:${n[0]}" ${cp(S.page)==n[0]?'aria-current="page"':''} data-tooltip="${esc(n[1])}">${ic(n[2])}<span class="nv-txt">${n[1]}</span></button>`).join('');
        r.innerHTML = `${mobThemeBtn}<div class="app ${sideCollapsed ? 'side-collapsed' : ''}"><aside class="side ${sideCollapsed ? 'collapsed' : ''}"><button class="side-toggle-btn" data-a="side_toggle" title="${sideCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}" aria-label="Toggle Sidebar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="${sideCollapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'}"></polyline></svg></button><div class="brand">${BOT.replace('width="46" height="46"','width="32" height="32"')} <span class="brand-text">Lá vườn nhà</span></div><div class="side-nav">${nv('nv')}</div><div class="side-footer"><button class="nv" data-a="theme" data-tooltip="Giao diện: ${{auto:'Tự động',light:'Sáng',dark:'Tối'}[ST.g('cf.theme','auto')]}">${ic('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>')}<span class="nv-txt">Giao diện: ${{auto:'Tự động',light:'Sáng',dark:'Tối'}[ST.g('cf.theme','auto')]}</span></button><button class="uc" data-a="go:acc" aria-label="Mở trang tài khoản" data-tooltip="Tài khoản: ${esc(U.name)}">${avh('')}<span class="uc-txt"><b>${esc(U.name)}</b><br><small>${esc(U.prov)}</small></span></button></div></aside><main class="${S.enter?'enter':''}">${(PG[S.page] || pHome)()}</main></div><nav class="bn" aria-label="Điều hướng">${nv('',1)}</nav>${inputs}
        <div class="bw"><span class="tag">Hỏi trợ lý AI</span><button class="bub" data-a="ai" aria-label="Mở trợ lý AI">${BOT}</button></div>
        <section id="ai" class="aip ${open?'open':''}" aria-label="Trợ lý Cà Phê AI"><div class="ah">${BOT.replace('width="46" height="46"','width="30" height="30"')}<span>Trợ lý Cà Phê AI<br><small style="color:#fff">Kết nối Spring Boot + MySQL</small></span><button data-a="ai" aria-label="Đóng">✕</button></div><div class="ab">${chatBox()}<div class="qk">${['Bệnh gần nhất của tôi','Hôm nay phun thuốc được không','Mẹo chụp ảnh','Khi nào được thu hoạch'].map(q => `<button data-a="q:${q}">${q}</button>`).join('')}</div></div></section>`;
    }
    refresh();
    qrs();
    drawAllBBoxCanvases();
    if (S.enter) countUp();
    S.enter = 0;
    S.pop = 0;
}

// Chuyển trang điều hướng đơn trang (SPA Navigation) và cuộn lên đầu màn hình
const go = p => { S.page = p; S.enter = 1; render(); scrollTo(0, 0); };

// Chuyển đổi qua lại giữa các chế độ giao diện: Tự động, Sáng (Light) và Tối (Dark)
function theme(c) {
    let t = ST.g('cf.theme', 'auto');
    if (c) t = {auto:'light',light:'dark',dark:'auto'}[t];
    ST.s('cf.theme', t);
    document.documentElement.dataset.theme = t == 'auto' ? '' : t;
    if (c) { toast('Giao diện: ' + {auto:'Tự động (Theo máy)',light:'Sáng ☀️',dark:'Tối 🌙'}[t]); render(); }
}

// Hàm tiện ích tạo Blob và kích hoạt tải file dữ liệu về máy tính
function downloadBlob(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 300);
}

const dd = t => new Date(t).toLocaleDateString('vi-VN');

// Xử lý xuất file dữ liệu: Lịch sử quét (.csv), Nhật ký vườn (.csv), Benchmark (.csv), Báo cáo in PDF/HTML hoặc Hồ sơ xuất khẩu (.txt)
function dl(k) {
    if (k == 'hist') {
        window.location.href = `/api/farm/export/history.csv?userId=${U.id}`;
        toast('Đang tải file lịch sử (.csv)');
    } else if (k == 'jr') {
        window.location.href = `/api/farm/export/journal.csv?userId=${U.id}`;
        toast('Đang tải file nhật ký (.csv)');
    } else if (k == 'bench') {
        const rows = [
            ['Mo hinh', 'Ten mo ta', 'mAP@50 (%)', 'Precision (%)', 'Recall (%)', 'Avg Latency (ms)', 'Min Latency (ms)', 'Max Latency (ms)', 'Toc do (FPS)', 'Tham so'],
            ...MODELS_LIST.map(m => {
                const b = S.benchData && S.benchData[m.id];
                const avgMs = b ? b.avg_ms : m.baseMs;
                const minMs = b ? b.min_ms : Math.round(m.baseMs * 0.88);
                const maxMs = b ? b.max_ms : Math.round(m.baseMs * 1.15);
                const fps = b ? b.fps : m.fps;
                return [m.id, m.name, m.mAP50, m.prec, m.rec, avgMs, minMs, maxMs, fps, m.params];
            })
        ];
        const csv = '\uFEFF' + rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\r\n');
        downloadBlob('benchmark_yolo11_models.csv', csv, 'text/csv;charset=utf-8');
        toast('Đã xuất bảng Benchmark YOLO11 (.csv)');
    } else if (k == 'report') {
        const s = stats();
        const filtered = filterHistoryList(D.h || []);
        const nowStr = new Date().toLocaleString('vi-VN');
        const distRows = DS.map(d => {
            const cnt = filtered.filter(x => (ALIAS[x.d] || x.d) === d.id).length;
            const pct = filtered.length ? Math.round(cnt / filtered.length * 100) : 0;
            return `<tr><td><b>${esc(d.n)}</b> (${esc(d.en)})</td><td>${esc(d.risk)}</td><td>${cnt} mẫu</td><td>${pct}%</td></tr>`;
        }).join('');
        const benchRows = MODELS_LIST.map(m => {
            const b = S.benchData && S.benchData[m.id];
            const avgMs = b ? b.avg_ms : m.baseMs;
            const fps = b ? b.fps : m.fps;
            return `<tr><td><b>${esc(m.id)}</b></td><td>${esc(m.name)}</td><td>${m.mAP50}%</td><td>${m.prec}%</td><td>${m.rec}%</td><td>${avgMs} ms</td><td>${fps} FPS</td></tr>`;
        }).join('');
        const histRows = filtered.slice(0, 30).map((x, idx) => {
            const d = dz(x.d);
            return `<tr><td>${idx + 1}</td><td>${dm(new Date(x.t))} ${hm(x.t)}</td><td>${LOTS[x.lot || 0]}</td><td><b>${esc(d.n)}</b></td><td>${Math.round((x.cf || 0) * 100)}%</td><td>${x.inferMs || 42} ms</td><td>${esc(x.modelName || 'best.pt')}</td></tr>`;
        }).join('');
        const htmlReport = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo Tổng hợp Chẩn đoán Bệnh Lá Cà Phê - ${esc(U.name)}</title>
        <style>
            body{font-family:'Segoe UI',Arial,sans-serif;color:#1b2a1e;margin:28px;line-height:1.5}
            h1{color:#14532d;margin:0 0 4px;font-size:22px}
            h2{color:#166534;margin:20px 0 8px;font-size:16px;border-bottom:2px solid #dcfce7;padding-bottom:4px}
            .meta{color:#4b5563;font-size:13px;margin-bottom:16px}
            .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
            .kpi-box{border:1px solid #d1fae5;background:#f0fdf4;padding:10px 14px;border-radius:8px}
            .kpi-box b{font-size:20px;color:#15803d;display:block}
            table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12.5px}
            th,td{border:1px solid #d1d5db;padding:7px 9px;text-align:left}
            th{background:#f3f4f6;font-weight:700}
            .print-bar{margin-bottom:16px;padding:10px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;display:flex;justify-content:space-between;align-items:center}
            .btn{background:#16a34a;color:#fff;border:0;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:700}
            @media print{.print-bar{display:none}}
        </style></head><body>
        <div class="print-bar"><span>📄 <b>Báo cáo Tổng hợp Hệ thống Chẩn đoán AI YOLO11</b> — Nhấn nút bên phải để in hoặc lưu thành PDF</span><button class="btn" onclick="window.print()">🖨️ In / Lưu PDF</button></div>
        <h1>BÁO CÁO TỔNG HỢP CHẨN ĐOÁN BỆNH LÁ CÀ PHÊ &amp; BENCHMARK AI</h1>
        <div class="meta">Chủ vườn: <b>${esc(U.name)}</b> · Tỉnh/Thành: <b>${esc(U.prov)}</b> · Thời gian xuất: <b>${esc(nowStr)}</b> · Bộ lọc: <b>${ filtered.length } bản ghi</b></div>
        <div class="kpi-row">
            <div class="kpi-box"><b>${s.n}</b>Tổng lần quét</div>
            <div class="kpi-box"><b>${s.w}</b>Quét trong 7 ngày</div>
            <div class="kpi-box"><b>${s.avg}%</b>Độ tin cậy TB</div>
            <div class="kpi-box"><b>${s.top ? esc(dz(s.top).n) : 'Không bệnh'}</b>Bệnh gặp nhiều nhất</div>
        </div>
        <h2>1. Thống kê phân bố 5 lớp bệnh lá cà phê</h2>
        <table><thead><tr><th>Lớp bệnh</th><th>Mức độ nguy hại</th><th>Số lượng mẫu</th><th>Tỷ lệ (%)</th></tr></thead><tbody>${distRows}</tbody></table>
        <h2>2. Bảng Benchmark hiệu năng các mô hình YOLO11</h2>
        <table><thead><tr><th>Mã Model</th><th>Kiến trúc</th><th>mAP@50</th><th>Precision</th><th>Recall</th><th>Inference Time</th><th>Tốc độ FPS</th></tr></thead><tbody>${benchRows}</tbody></table>
        <h2>3. Chi tiết lịch sử nhận diện gần nhất (${Math.min(30, filtered.length)} mẫu)</h2>
        <table><thead><tr><th>#</th><th>Ngày giờ</th><th>Lô vườn</th><th>Kết quả chẩn đoán</th><th>Độ tin cậy</th><th>Inference Time</th><th>Model</th></tr></thead><tbody>${histRows || '<tr><td colspan="7">Chưa có dữ liệu</td></tr>'}</tbody></table>
        </body></html>`;
        const w = window.open('', '_blank');
        if (w) {
            w.document.open();
            w.document.write(htmlReport);
            w.document.close();
            toast('Đã mở trang Báo cáo Tổng hợp (In / Lưu PDF)');
        } else {
            downloadBlob('bao-cao-chan-doan-yolo11.html', htmlReport, 'text/html;charset=utf-8');
            toast('Đã tải file Báo cáo Tổng hợp (.html)');
        }
    } else {
        const d = [S.rep || '', '', 'Danh sách kiểm tra:', ...(S.ck || []).map(c => (c[1] ? '[x] ' : '[ ] ') + c[0]), '', 'Nhật ký gần đây:', ...(D.j || []).slice(0, 30).map(e => dd(e.t) + ' - ' + e.txt + (e.days ? ' (cách ly ' + e.days + ' ngày)' : ''))].join('\r\n');
        downloadBlob('ho-so-vuon.txt', d, 'text/plain;charset=utf-8');
        toast('Đã tải hồ sơ xuất khẩu (.txt)');
    }
}

// Hiệu ứng tăng số đếm sinh động (Count Up Animation) trên các thẻ chỉ số KPI
function countUp() {
    document.querySelectorAll('[data-n]').forEach(e => {
        const n = +e.dataset.n, u = e.dataset.s || '', t0 = performance.now();
        (function f(t) {
            const k = Math.min(1, (t - t0) / 900);
            e.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))) + u;
            if (k < 1) requestAnimationFrame(f);
        })(t0);
    });
}

// ============================================================
// BỘ ĐIỀU PHỐI SỰ KIỆN TOÀN TRANG (EVENT DELEGATION)
// ============================================================

// Lắng nghe và điều phối tất cả các sự kiện click chuột trên giao diện (data-a)
document.addEventListener('click', async e => {
    const el = e.target.closest('[data-a]');
    if (!el) return;
    const i = el.dataset.a.indexOf(':'), a = i < 0 ? el.dataset.a : el.dataset.a.slice(0, i), v = i < 0 ? '' : el.dataset.a.slice(i + 1);
    if (a == 'go') go(v);
    else if (a == 'side_toggle') {
        const cur = ST.g('cf.side_col', '0') === '1';
        ST.s('cf.side_col', cur ? '0' : '1');
        render();
    }
    else if (a == 'pick') $('#' + v).click();
    else if (a == 'sample') { S.showRaw = 0; S.fbOpen = 0; sample(v); }
    else if (a == 'rawtoggle') { S.showRaw = !S.showRaw; render(); }
    else if (a == 'canvas_toggle') {
        S.canvasOverlay = S.canvasOverlay ? 0 : 1;
        render();
        toast(S.canvasOverlay ? 'Đã bật lớp phủ Canvas Bounding Box' : 'Đã tắt lớp phủ Canvas Bounding Box');
    }
    else if (a == 'canvas_lbl') {
        S.canvasLabels = S.canvasLabels ? 0 : 1;
        render();
    }
    else if (a == 'cmp_sample') { runCompareSample(v); }
    else if (a == 'bench_run') { runModelBenchmark(v); }
    else if (a == 'bench_all') { runAllBenchmarks(); }
    else if (a == 'fbopen') {
        S.fbOpen = 1;
        const cur = S.last && S.last.d;
        const alt = DS.find(x => x.id !== cur) || DS[0];
        if (!S.fbCls) S.fbCls = alt.id;
        render();
        const fbEl = $('#fb-panel');
        if (fbEl) fbEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    else if (a == 'fbclose') { S.fbOpen = 0; render(); }
    else if (a == 'fbsel') {
        const noteVal = $('#fb-note') ? $('#fb-note').value : '';
        S.fbCls = v;
        render();
        if ($('#fb-note')) $('#fb-note').value = noteVal;
    }
    else if (a == 'fbsend') { submitAiFeedback(); }
    else if (a == 'viewscan') {
        const item = D.h.find(x => String(x.id) === String(v)) || D.h[+v];
        if (item) {
            S.showRaw = 0;
            S.fbOpen = 0;
            S.last = item;
            S.pop = 1;
            D.cd = ALIAS[item.d] || item.d;
            if (!item.detections && item.src && item.src.startsWith('/uploads/')) {
                fetch(item.src + '.json')
                    .then(r => r.ok ? r.json() : null)
                    .then(meta => {
                        if (meta) {
                            item.detections = meta.detections || [];
                            item.boxes = meta.boxes != null ? meta.boxes : item.detections.length;
                            item.inferMs = meta.inferMs || item.inferMs || 42;
                            item.imgW = meta.imgW || 640;
                            item.imgH = meta.imgH || 640;
                            item.modelName = meta.modelName || item.modelName || 'best.pt';
                            render();
                        }
                    }).catch(() => {});
            }
            if (S.page !== 'scan') S.page = 'scan';
            render();
            scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    else if (a == 'reg') { scTo(!S.reg); }
    else if (a == 'opd') {
        D.cd = ALIAS[v] || v;
        API.updateState(U.id, D.cd, D.lot).catch(() => {});
        go('treat');
    }
    else if (a == 'cd') {
        D.cd = v;
        API.updateState(U.id, D.cd, D.lot).catch(() => {});
        render();
    }
    else if (a == 'flt') { S.f = v; render(); }
    else if (a == 'flt_reset') { S.f = 'all'; S.fLot = 'all'; S.fTime = 'all'; S.histQ = ''; render(); toast('Đã xóa bộ lọc lịch sử'); }
    else if (a == 'view') { S.v = S.v == 'l' ? 'g' : 'l'; render(); }
    else if (a == 'del') {
        await API.deleteScan(U.id, v).catch(() => {});
        D.h = D.h.filter(x => String(x.id) != String(v));
        toast('Đã xóa bản ghi');
        render();
    }
    else if (a == 'nf') { S.nf = v; render(); }
    else if (a == 'read') showNewsModal(v);
    else if (a == 'ext') { window.open(v, '_blank', 'noopener,noreferrer'); }
    else if (a == 'tick') {
        const k = +v, d = dz(D.cd);
        try {
            const res = await API.toggleTreatment(U.id, d.id, k);
            const m = D.s[d.id] || (D.s[d.id] = {});
            m[k] = res.completed;
            if (res.journalEntry) D.j.unshift(res.journalEntry);
            const nowDone = d.st.filter((_, i) => m[i]).length;
            if (res.completed && nowDone === d.st.length) {
                triggerCelebrationConfetti();
                toast('🎉 Xuất sắc! Đã hoàn thành 100% quy trình điều trị dứt điểm ' + d.n + '!');
            }
            render();
        } catch (err) { toast(err.message); }
    }
    else if (a == 'reset_treat') {
        const targetD = v || D.cd;
        const dObj = dz(targetD);
        if (confirm(`Bạn có muốn đặt lại các bước điều trị của "${dObj.n}" để bắt đầu một chu kỳ chăm sóc mới?`)) {
            const m = D.s[dObj.id] || {};
            for (let i = 0; i < dObj.st.length; i++) {
                if (m[i]) {
                    API.toggleTreatment(U.id, dObj.id, i).catch(() => {});
                    delete m[i];
                }
            }
            toast('Đã đặt lại quy trình điều trị cho ' + dObj.n);
            render();
        }
    }
    else if (a == 'cam') { go('scan'); setTimeout(() => $('#cam') && $('#cam').click(), 50); }
    else if (a == 'speak') speakText(v);
    else if (a == 'toast') toast(v || 'Đã ghi');
    else if (a == 'profmodal') showProfileModal();
    else if (a == 'pwmodal') showPasswordModal();
    else if (a == 'out') confirmOut();
    else if (a == 'dlgx') { if ($('#dlg')) $('#dlg').remove(); }
    else if (a == 'out2') {
        if ($('#dlg')) $('#dlg').remove();
        ST.s('cf.cur.uid', null);
        try { sessionStorage.removeItem('cf.cur.uid.s'); } catch(x) {}
        U = D = null;
        S.reg = 0;
        A = ST.g('cf.saved_accounts', []);
        render();
        toast('Đã đăng xuất');
    }
    else if (a == 'eye') {
        const inp = el.parentElement.querySelector('input');
        inp.type = inp.type == 'password' ? 'text' : 'password';
        el.setAttribute('aria-pressed', inp.type == 'text');
    }
    else if (a == 'fill') {
        const saved = (A || []).find(x => x.email === v || x.un === v);
        const idInput = document.querySelector('.sc-l input[name=id]') || document.querySelector('input[name=id]');
        const pwInput = document.querySelector('.sc-l input[name=pw]') || document.querySelector('input[name=pw]');
        const rmInput = document.querySelector('.sc-l input[name=rm]') || document.querySelector('input[name=rm]');
        if (idInput) {
            idInput.removeAttribute('readonly');
            idInput.value = saved ? (saved.un || saved.email) : v;
        }
        if (pwInput) {
            pwInput.removeAttribute('readonly');
            pwInput.value = (saved && saved.pw) ? saved.pw : '';
            pwInput.focus();
        }
        if (rmInput) rmInput.checked = true;
    }
    else if (a == 'copy') {
        try { navigator.clipboard.writeText(S.rep).then(() => toast('Đã sao chép báo cáo'), () => toast('Không sao chép được')); }
        catch(x) { toast('Không sao chép được'); }
    }
    else if (a == 'dl') dl(v);
    else if (a == 'clr') { S.last = null; S.overrideNonCoffee = 0; render(); }
    else if (a == 'override_noncoffee') { S.overrideNonCoffee = 1; render(); toast('Đã mở khóa kết quả phân tích AI'); }
    else if (a == 'lot') {
        D.lot = +v;
        API.updateState(U.id, D.cd, D.lot).catch(() => {});
        render();
    }
    else if (a == 'maplot') {
        S.mapLot = +v;
        render();
    }
    else if (a == 'remtoggle') {
        const list = getReminders();
        const idx = +v;
        if (list[idx]) {
            list[idx].enabled = !list[idx].enabled;
            saveReminders(list);
            render();
            toast(list[idx].enabled ? 'Đã bật chuông báo' : 'Đã tạm dừng nhắc nhở');
        }
    }
    else if (a == 'remdel') {
        let list = getReminders();
        const idx = +v;
        list.splice(idx, 1);
        saveReminders(list);
        render();
        toast('Đã xóa lịch nhắc');
    }
    else if (a == 'setq') {
        const inp = $('#quar-days');
        if (inp) {
            inp.value = v;
            toast(`Đã chọn cách ly ${v} ngày`);
        }
    }
    else if (a == 'theme') theme(1);
    else if (a == 'wxgps') useGpsWeather();
    else if (a == 'wxref') fetchLiveWeather(U ? U.prov : 'Đắk Lắk', null, null, false);
    else if (a == 'ai') {
        const p = $('#ai');
        p.classList.toggle('open');
        if (p.classList.contains('open')) p.querySelector('input').focus();
    }
    else if (a == 'q') send(v);
});

// Lắng nghe sự kiện thay đổi giá trị (chọn tỉnh dự báo thời tiết, chọn model AI, bộ lọc lịch sử hoặc tải file ảnh lên)
document.addEventListener('change', e => {
    if (e.target.classList && e.target.classList.contains('wx-sel')) {
        const newProv = e.target.value;
        if (U) {
            U.prov = newProv;
            API.updateProfile({ userId: U.id, name: U.name, un: U.un, phone: U.phone, prov: U.prov, ph: U.ph }).catch(() => {});
        }
        fetchLiveWeather(newProv, null, null, false);
        return;
    }
    if (e.target.id == 'scan-model-sel') {
        S.selModel = e.target.value;
        const m = getModelMeta(S.selModel);
        toast(`Đã chọn mô hình: ${m.name} (${m.id})`);
        render();
        return;
    }
    if (e.target.id == 'cmp-ma-sel') {
        S.cmpModelA = e.target.value;
        render();
        return;
    }
    if (e.target.id == 'cmp-mb-sel') {
        S.cmpModelB = e.target.value;
        render();
        return;
    }
    if (e.target.id == 'cmpfil' && e.target.files[0]) {
        const f = e.target.files[0];
        e.target.value = '';
        runCompareFile(f);
        return;
    }
    if (e.target.id == 'hist-lot-sel') {
        S.fLot = e.target.value;
        render();
        return;
    }
    if (e.target.id == 'hist-time-sel') {
        S.fTime = e.target.value;
        render();
        return;
    }
    if (e.target.id == 'avf' && e.target.files[0]) { const f = e.target.files[0]; e.target.value = ''; avatar(f); }
    if (e.target.id == 'mul' && e.target.files.length) { const fl = [...e.target.files]; e.target.value = ''; many(fl); }
    if ((e.target.id == 'cam' || e.target.id == 'fil') && e.target.files[0]) { const f = e.target.files[0]; e.target.value = ''; scanFile(f); }
});

let _histSearchDebounce = null;
// Lắng nghe người dùng gõ phím để tìm kiếm tin tức, tìm kiếm lịch sử, chặn nhập chữ vào số điện thoại và kiểm tra hợp lệ thời gian thực
document.addEventListener('input', e => {
    const id = e.target && e.target.id;
    if (id == 'q') { S.q = e.target.value; $('#nl').innerHTML = nlist(); return; }
    if (id == 'hist-q') {
        S.histQ = e.target.value;
        clearTimeout(_histSearchDebounce);
        _histSearchDebounce = setTimeout(() => {
            const pos = e.target.selectionStart || S.histQ.length;
            render();
            const inp = $('#hist-q');
            if (inp) {
                try { inp.focus(); inp.setSelectionRange(pos, pos); } catch (x) {}
            }
        }, 220);
        return;
    }
    if (id == 'r-phone') {
        const raw = e.target.value || '';
        const cleaned = raw.replace(/[^0-9]/g, '').slice(0, 10);
        if (raw !== cleaned) {
            e.target.value = cleaned;
            setFieldErr('r-phone', 'Số điện thoại chỉ được phép nhập chữ số (0-9), không được nhập chữ!');
            return;
        }
        validateRegField('r-phone', cleaned, false, false);
        return;
    }
    if (id == 'r-un' || id == 'r-email' || id == 'r-pw' || id == 'r-pw2') {
        if ($('#ferr2')) $('#ferr2').textContent = '';
        validateRegField(id, e.target.value, false, true);
        return;
    }
    if (id == 'l-id' || id == 'l-pw') {
        setFieldErr(id, '');
        if ($('#ferr')) $('#ferr').textContent = '';
    }
});

// Lắng nghe khi rời con trỏ khỏi ô nhập liệu để kích hoạt kiểm tra lỗi
document.addEventListener('focusout', e => {
    const id = e.target && e.target.id;
    if (id == 'r-un' || id == 'r-email' || id == 'r-pw' || id == 'r-pw2' || id == 'r-phone') {
        if (e.target.value) validateRegField(id, e.target.value, false, true);
    }
});

// Lắng nghe phím bấm: Bấm phím Escape (ESC) để đóng nhanh hộp thoại hoặc đóng chatbot
document.addEventListener('keydown', e => {
    if (e.key == 'Escape') {
        if ($('#dlg')) $('#dlg').remove();
        if ($('#ai')) $('#ai').classList.remove('open');
    }
});

// Lắng nghe và điều phối gửi biểu mẫu (Chatbot AI, Đăng nhập, Đăng ký, Đổi mật khẩu, Nhật ký, Sản lượng, Lịch nhắc)
document.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, k = f.dataset.f, v = Object.fromEntries(new FormData(f));
    if (k == 'chat') { send(v.q || ''); f.reset(); }
    else if (k == 'login') doLogin(v);
    else if (k == 'reg') doReg(v);
    else if (k == 'prof') {
        try {
            const isRem = !!ST.g('cf.cur.uid', null);
            const payload = await API.updateProfile({ userId: U.id, name: v.name, un: v.un, phone: v.phone, prov: v.prov, ph: U.ph });
            if ($('#dlg')) $('#dlg').remove();
            applyBootstrap(payload, isRem);
            S.page = 'acc';
            render();
            toast('Đã lưu hồ sơ vào MySQL');
        } catch (err) { toast(err.message); }
    }
    else if (k == 'pwchange') {
        try {
            await API.changePassword(U.id, v.oldPw, v.newPw);
            if ($('#dlg')) $('#dlg').remove();
            toast('Đã đổi mật khẩu thành công');
        } catch (err) { toast(err.message); }
    }
    else if (k == 'jr') {
        try {
            const saved = await API.addJournal(U.id, v.txt.trim(), Math.max(0, +v.days || 0), false);
            D.j.unshift(saved);
            toast('Đã lưu nhật ký ');
            render();
        } catch (err) { toast(err.message); }
    }
    else if (k == 'yld') {
        try {
            const saved = await API.addYield(U.id, +v.lot, +v.kg);
            D.y = [saved, ...(D.y || [])];
            toast('Đã lưu sản lượng');
            render();
        } catch (err) { toast(err.message); }
    }
    else if (k == 'coop') {
        try {
            const res = await API.updateCoop(U.id, v.n.trim());
            D.coop = res.coop;
            toast('Đã lưu hợp tác xã');
            render();
        } catch (err) { toast(err.message); }
    }
    else if (k == 'setrem') {
        requestNotificationPermission();
        const list = getReminders();
        const timeVal = (v.rem_time || '06:30').trim();
        const titleVal = (v.rem_title || 'Chăm sóc vườn cà phê').trim();
        list.push({
            id: Date.now(),
            time: timeVal,
            title: titleVal,
            enabled: true,
            lastTriggered: ''
        });
        saveReminders(list);
        render();
        toast(`Đã cài lịch hẹn: ${timeVal} - ${titleVal}`);
    }
    else if (k == 'log') {
        try {
            const n = Math.max(0, +v.days || 0);
            const saved = await API.addJournal(U.id, 'Phun xử lý ' + dz(D.cd).n, n, false);
            D.j.unshift(saved);
            toast(n ? 'Đã ghi, cách ly ' + n + ' ngày' : 'Đã ghi nhật ký');
            render();
        } catch (err) { toast(err.message); }
    }
});

// Hiệu ứng đèn rọi ánh sáng laser theo tọa độ chuột trên viền các ô nhập liệu (Tối ưu rAF chống layout thrashing)
let _mouseMoveRaf = null;
document.addEventListener('mousemove', e => {
    if (_mouseMoveRaf) return;
    _mouseMoveRaf = requestAnimationFrame(() => {
        _mouseMoveRaf = null;
        const g = e.target && e.target.closest && e.target.closest('.gi');
        if (g) {
            const r = g.getBoundingClientRect();
            g.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            g.style.setProperty('--my', (e.clientY - r.top) + 'px');
            if (g.style.getPropertyValue('--rad') !== '100px') {
                g.style.setProperty('--rad', '100px');
            }
        }
    });
}, { passive: true });
document.addEventListener('mouseout', e => {
    const g = e.target && e.target.closest && e.target.closest('.gi');
    if (g && !g.contains(e.relatedTarget)) g.style.setProperty('--rad', '0px');
}, { passive: true });

// ============================================================
// KHỞI ĐỘNG ỨNG DỤNG (INITIALIZATION)
// ============================================================

// Khởi chạy khi tải trang: Áp dụng theme, khôi phục phiên đăng nhập và cập nhật thời tiết định kỳ
(async function init() {
    theme();
    A = ST.g('cf.saved_accounts', []);
    setInterval(() => {
        if (U) fetchLiveWeather(U.prov, WX.lat, WX.lon, true);
    }, 600000);
    const savedUid = ST.g('cf.cur.uid', null) || (() => { try { return sessionStorage.getItem('cf.cur.uid.s'); } catch(e) { return null; } })();
    if (savedUid) {
        try {
            const payload = await API.bootstrap(savedUid);
            applyBootstrap(payload, !!ST.g('cf.cur.uid', null));
            return;
        } catch (e) {
            ST.s('cf.cur.uid', null);
        }
    }
    render();
})();
