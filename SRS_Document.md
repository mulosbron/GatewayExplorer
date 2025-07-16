# AR.IO Gateway Explorer - Software Requirements Specification (SRS)

## 1. Giriş

### 1.1 Amaç
Bu döküman, AR.IO Gateway Explorer uygulamasının yazılım gereksinimlerini tanımlar. Bu uygulama, AR.IO ağının gateway altyapısını görselleştirmek ve analiz etmek için geliştirilmiş kapsamlı bir web uygulamasıdır.

### 1.2 Kapsam
AR.IO Gateway Explorer, AR.IO ağındaki gateway'lerin coğrafi dağılımını, ağ topolojisini ve performans metriklerini görselleştiren interaktif bir platformdur. Uygulama, harita görünümü, ağ grafiği ve istatistiksel analiz araçları sunar.

### 1.3 Tanımlar ve Kısaltmalar
- **AR.IO**: Arweave ağında veri erişimi sağlayan gateway protokolü
- **Gateway**: AR.IO ağında veri barındırma ve sorgulama hizmeti veren düğümler
- **Permaweb**: Arweave ağında kalıcı olarak saklanan web içerikleri
- **Stake**: Gateway'lerin ağa katılım için yatırdıkları ARIO token miktarı
- **D3.js**: Veri görselleştirme kütüphanesi
- **Leaflet.js**: İnteraktif harita kütüphanesi

### 1.4 Referanslar
- AR.IO Foundation dokümantasyonu
- React.js resmi dokümantasyonu
- D3.js kullanım kılavuzu
- Leaflet.js API referansı

## 2. Sistem Genel Bakış

### 2.1 Sistem Perspektifi
AR.IO Gateway Explorer, AR.IO ağının gateway altyapısını analiz etmek ve görselleştirmek için tasarlanmış bağımsız bir web uygulamasıdır. Sistem, AR.IO API'sinden gateway verilerini çeker, coğrafi konum bilgilerini işler ve kullanıcılara interaktif görselleştirmeler sunar.

### 2.2 Sistem Özellikleri
- **Modüler Mimari**: React tabanlı bileşen mimarisi
- **Responsive Tasarım**: Tüm cihazlarda uyumlu çalışma
- **Gerçek Zamanlı Veri**: Canlı gateway durumu ve performans metrikleri
- **İnteraktif Görselleştirme**: Harita, grafik ve istatistiksel analiz araçları

### 2.3 Kullanıcı Sınıfları
- **AR.IO Geliştiricileri**: Gateway performansını izlemek için
- **Ağ Yöneticileri**: Ağ sağlığını ve dağılımını analiz etmek için
- **Araştırmacılar**: AR.IO ağının coğrafi ve teknik analizi için
- **Genel Kullanıcılar**: AR.IO ekosistemini keşfetmek için

## 3. Fonksiyonel Gereksinimler

### 3.1 Kullanıcı Arayüzü Gereksinimleri

#### 3.1.1 Ana Navigasyon
- **Gereksinim ID**: UI-001
- **Açıklama**: Kullanıcılar harita, grafik ve istatistik görünümleri arasında geçiş yapabilmelidir
- **Öncelik**: Yüksek
- **Kabul Kriterleri**:
  - Üst menüde üç ana sekme bulunmalı: Map, Graph, Statistics
  - Aktif sekme görsel olarak vurgulanmalı
  - Geçişler anında gerçekleşmeli

#### 3.1.2 Responsive Tasarım
- **Gereksinim ID**: UI-002
- **Açıklama**: Uygulama tüm ekran boyutlarında düzgün çalışmalıdır
- **Öncelik**: Yüksek
- **Kabul Kriterleri**:
  - Mobil cihazlarda (320px+) uyumlu çalışma
  - Tablet cihazlarda (768px+) optimize edilmiş görünüm
  - Masaüstü cihazlarda (1024px+) tam özellikli deneyim

### 3.2 Harita Görünümü Gereksinimleri

#### 3.2.1 Gateway Konumlandırma
- **Gereksinim ID**: MAP-001
- **Açıklama**: Gateway'ler coğrafi konumlarına göre haritada gösterilmelidir
- **Öncelik**: Kritik
- **Kabul Kriterleri**:
  - Her gateway için doğru koordinatlar gösterilmeli
  - Gateway durumuna göre renk kodlaması (yeşil: online, kırmızı: offline, turuncu: bilinmiyor)
  - Stake miktarına göre marker boyutu değişmeli

#### 3.2.2 Marker Kümeleme
- **Gereksinim ID**: MAP-002
- **Açıklama**: Yakın konumdaki gateway'ler kümelenmelidir
- **Öncelik**: Yüksek
- **Kabul Kriterleri**:
  - Zoom seviyesine göre otomatik kümeleme
  - Küme boyutuna göre dinamik boyutlandırma
  - Küme tıklaması ile zoom yapma

#### 3.2.3 Gateway Detayları
- **Gereksinim ID**: MAP-003
- **Açıklama**: Gateway'lere tıklandığında detaylı bilgiler gösterilmelidir
- **Öncelik**: Yüksek
- **Kabul Kriterleri**:
  - Modal pencerede gateway bilgileri
  - Performans metrikleri (response time, uptime)
  - Stake ve teknik bilgiler

### 3.3 Grafik Görünümü Gereksinimleri

#### 3.3.1 Ağ Topolojisi
- **Gereksinim ID**: GRAPH-001
- **Açıklama**: Gateway'ler arasındaki bağlantıları gösteren interaktif grafik
- **Öncelik**: Yüksek
- **Kabul Kriterleri**:
  - D3.js ile force-directed graph
  - Düğüm sürükleme ve zoom özellikleri
  - Bağlantı vurgulama

#### 3.3.2 Hiyerarşik Görünüm
- **Gereksinim ID**: GRAPH-002
- **Açıklama**: Gateway'ler ülke, bölge, şehir ve ISP'ye göre gruplandırılmalı
- **Öncelik**: Orta
- **Kabul Kriterleri**:
  - Çok seviyeli hiyerarşi desteği
  - Seviye filtreleme kontrolleri
  - Dinamik görünüm değiştirme

#### 3.3.3 İnteraktif Seçim
- **Gereksinim ID**: GRAPH-003
- **Açıklama**: Düğümlere tıklandığında bağlantılı düğümler vurgulanmalı
- **Öncelik**: Yüksek
- **Kabul Kriterleri**:
  - Bağlantılı düğümlerin opacity değişimi
  - Boşluğa tıklayarak seçimi sıfırlama
  - Tooltip bilgileri

### 3.4 İstatistik Görünümü Gereksinimleri

#### 3.4.1 Genel Metrikler
- **Gereksinim ID**: STAT-001
- **Açıklama**: Ağ genelinde özet istatistikler gösterilmelidir
- **Öncelik**: Yüksek
- **Kabul Kriterleri**:
  - Toplam gateway sayısı
  - Online/offline oranları
  - Coğrafi dağılım özeti
  - Toplam stake miktarı

#### 3.4.2 Detaylı Analizler
- **Gereksinim ID**: STAT-002
- **Açıklama**: Çeşitli kategorilerde detaylı istatistikler
- **Öncelik**: Orta
- **Kabul Kriterleri**:
  - Ülke bazında dağılım grafikleri
  - ISP konsantrasyon analizi
  - Stake dağılımı histogramları
  - Performans trendleri

### 3.5 Filtreleme Gereksinimleri

#### 3.5.1 Arama Filtresi
- **Gereksinim ID**: FILTER-001
- **Açıklama**: Gateway'leri domain, etiket veya konuma göre arama
- **Öncelik**: Yüksek
- **Kabul Kriterleri**:
  - Gerçek zamanlı arama
  - Çoklu alan desteği
  - Otomatik tamamlama

#### 3.5.2 Durum Filtresi
- **Gereksinim ID**: FILTER-002
- **Açıklama**: Gateway durumuna göre filtreleme
- **Öncelik**: Yüksek
- **Kabul Kriterleri**:
  - Online/offline/unknown seçenekleri
  - Çoklu seçim desteği
  - Anında filtreleme

#### 3.5.3 Coğrafi Filtreler
- **Gereksinim ID**: FILTER-003
- **Açıklama**: Ülke ve ISP'ye göre filtreleme
- **Öncelik**: Orta
- **Kabul Kriterleri**:
  - Dropdown menüler
  - Dinamik seçenek listesi
  - Filtre kombinasyonları

## 4. Dış Arayüz Gereksinimleri

### 4.1 Kullanıcı Arayüzleri
- **Web Tarayıcı**: Modern tarayıcılarda çalışma (Chrome, Firefox, Safari, Edge)
- **Responsive Tasarım**: Mobil, tablet ve masaüstü uyumluluğu
- **Erişilebilirlik**: WCAG 2.1 AA standartlarına uygunluk

### 4.2 Yazılım Arayüzleri
- **AR.IO API**: Gateway verilerini çekmek için
- **IP Geolocation API**: Coğrafi konum çözümlemesi için
- **DNS-over-HTTPS**: Domain çözümlemesi için

### 4.3 İletişim Arayüzleri
- **HTTP/HTTPS**: API iletişimi
- **WebSocket**: Gerçek zamanlı güncellemeler (gelecek özellik)

## 5. Kalite Özellikleri

### 5.1 Performans Gereksinimleri
- **Sayfa Yükleme**: 3 saniye içinde tam yükleme
- **API Yanıt Süresi**: 2 saniye içinde veri çekme
- **Animasyon Performansı**: 60 FPS akıcı animasyonlar
- **Bellek Kullanımı**: 100MB'den az tarayıcı belleği

### 5.2 Güvenlik Gereksinimleri
- **HTTPS**: Tüm iletişim şifrelenmiş
- **API Key Güvenliği**: Environment variable kullanımı
- **XSS Koruması**: React'in built-in koruması
- **CORS**: Uygun cross-origin politikaları

### 5.3 Güvenilirlik Gereksinimleri
- **Uptime**: %99.9 kullanılabilirlik
- **Hata Toleransı**: API hatalarında graceful degradation
- **Veri Doğruluğu**: Gateway verilerinin doğru işlenmesi
- **Yedekleme**: Otomatik veri yedekleme

### 5.4 Kullanılabilirlik Gereksinimleri
- **Öğrenme Eğrisi**: 5 dakika içinde temel kullanım
- **Sezgisel Arayüz**: Kullanıcı dostu tasarım
- **Yardım Sistemi**: Tooltip ve açıklamalar
- **Erişilebilirlik**: Klavye navigasyonu ve screen reader desteği

## 6. Teknik Gereksinimler

### 6.1 Teknoloji Yığını
- **Frontend Framework**: React 19+
- **Harita Kütüphanesi**: Leaflet.js 1.9+
- **Grafik Kütüphanesi**: D3.js 7.9+
- **Routing**: React Router DOM 7.6+
- **HTTP Client**: Axios 1.10+
- **Styling**: CSS3 with CSS Variables

### 6.2 Mimari Gereksinimler
- **Component-Based Architecture**: Modüler React bileşenleri
- **Service Layer**: API iletişimi için ayrı servis katmanı
- **State Management**: React hooks ile yerel state yönetimi
- **Responsive Design**: Mobile-first yaklaşım

### 6.3 Veri Gereksinimleri
- **Gateway Verileri**: AR.IO API'den JSON formatında
- **Coğrafi Veriler**: IP Geolocation API'den
- **Performans Verileri**: Health check sonuçları
- **Cache Stratejisi**: Browser localStorage kullanımı

### 6.4 Deployment Gereksinimleri
- **Static Hosting**: Netlify, Vercel veya benzeri
- **Build Process**: npm run build ile production build
- **Environment Variables**: API key'ler için güvenli yönetim
- **CDN**: Statik asset'ler için content delivery network

## 7. Sistem Özellikleri

### 7.1 Modüler Yapı
```
src/
├── components/          # UI Bileşenleri
│   ├── Map.js          # Harita görünümü
│   ├── Graph.js        # Ağ grafiği
│   ├── Statistics.js   # İstatistikler
│   └── FilterPanel.js  # Filtreleme paneli
├── services/           # API Servisleri
│   └── gatewayService.js # Gateway veri yönetimi
└── App.js             # Ana uygulama bileşeni
```

### 7.2 Veri Akışı
1. **Veri Çekme**: AR.IO API'den gateway listesi
2. **IP Çözümleme**: Domain'lerden IP adresleri
3. **Coğrafi Konum**: IP'lerden koordinatlar
4. **Sağlık Kontrolü**: Gateway erişilebilirlik testi
5. **İşleme**: Veri normalizasyonu ve hesaplamalar
6. **Görselleştirme**: Harita, grafik ve istatistikler

### 7.3 State Yönetimi
- **Global State**: Gateway verileri ve filtreler
- **Local State**: UI bileşen durumları
- **Cache**: Browser localStorage ile veri önbellekleme
- **Real-time Updates**: Periyodik veri yenileme

## 8. Test Gereksinimleri

### 8.1 Birim Testleri
- **Component Tests**: React bileşenlerinin test edilmesi
- **Service Tests**: API servislerinin test edilmesi
- **Utility Tests**: Yardımcı fonksiyonların test edilmesi

### 8.2 Entegrasyon Testleri
- **API Integration**: AR.IO API ile entegrasyon
- **Map Integration**: Leaflet.js entegrasyonu
- **Graph Integration**: D3.js entegrasyonu

### 8.3 Kullanıcı Kabul Testleri
- **Functionality Testing**: Tüm özelliklerin çalışması
- **Usability Testing**: Kullanıcı deneyimi testleri
- **Performance Testing**: Performans metrikleri
- **Cross-browser Testing**: Farklı tarayıcılarda test

### 8.4 Test Kriterleri
- **Code Coverage**: %80+ kod kapsama oranı
- **Performance**: 3 saniye içinde sayfa yükleme
- **Accessibility**: WCAG 2.1 AA uyumluluğu
- **Responsive**: Tüm ekran boyutlarında çalışma

## 9. Güvenlik Gereksinimleri

### 9.1 Kimlik Doğrulama
- **API Key Management**: Güvenli API key saklama
- **Environment Variables**: Hassas verilerin korunması
- **HTTPS Enforcement**: Tüm iletişimin şifrelenmesi

### 9.2 Veri Güvenliği
- **Input Validation**: Kullanıcı girdilerinin doğrulanması
- **XSS Prevention**: Cross-site scripting koruması
- **CSRF Protection**: Cross-site request forgery koruması

### 9.3 Gizlilik
- **Data Minimization**: Minimum veri toplama
- **No Personal Data**: Kişisel veri toplanmaması
- **Transparent Processing**: Şeffaf veri işleme

## 10. Bakım ve Destek

### 10.1 Kod Kalitesi
- **ESLint**: Kod stil kontrolü
- **Prettier**: Kod formatlaması
- **TypeScript**: Tip güvenliği (gelecek sürüm)
- **Documentation**: Kapsamlı kod dokümantasyonu

### 10.2 Monitoring
- **Error Tracking**: Hata izleme ve raporlama
- **Performance Monitoring**: Performans metrikleri
- **User Analytics**: Kullanıcı davranış analizi
- **Uptime Monitoring**: Sistem kullanılabilirlik izleme

### 10.3 Güncelleme Stratejisi
- **Regular Updates**: Düzenli güvenlik güncellemeleri
- **Feature Releases**: Yeni özellik sürümleri
- **Backward Compatibility**: Geriye uyumluluk
- **Migration Guide**: Güncelleme kılavuzları

## 11. Gelecek Geliştirmeler

### 11.1 Kısa Vadeli (3-6 ay)
- **Advanced Filters**: Gelişmiş filtreleme seçenekleri
- **Export Features**: Veri dışa aktarma

### 11.2 Orta Vadeli (6-12 ay)
- **Historical Data**: Geçmiş performans verileri
- **Custom Dashboards**: Özelleştirilebilir paneller

### 11.3 Uzun Vadeli (1+ yıl)
- **Blockchain Integration**: Mümkünse AO il
- **Multi-chain Support**: Diğer ağlar için destek

## 12. Sonuç

Bu SRS dökümanı, AR.IO Gateway Explorer projesinin kapsamlı gereksinimlerini tanımlar. Proje, AR.IO ağının gateway altyapısını görselleştirmek ve analiz etmek için modern web teknolojileri kullanarak geliştirilmiştir.

Proje, kullanıcı dostu arayüzü, kapsamlı görselleştirme araçları ve gerçek zamanlı veri işleme yetenekleri ile AR.IO ekosisteminin anlaşılmasını ve yönetilmesini kolaylaştırmayı hedeflemektedir.

---

**Döküman Versiyonu**: 1.0  
**Son Güncelleme**: 2025  
**Hazırlayan**: mulosbron
**Onaylayan**: mulosbron