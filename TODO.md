# Gateway API Migration - Detaylı Todo List

## 1. Data Struktur Analizi ve Planlama

### 1.1 Mevcut Veri Kaynaklarını Analiz Et
- [ ] `api_gatewayexplorer.permagate.io` API'sinden gelen mevcut veri formatını tam olarak belgele
- [ ] ArioSDK JS paketinin `getGateways` fonksiyonundan gelen veri formatını tam olarak belgele
- [ ] `ipgeo_gatewayexplorer.permagate.io` API'sinden gelen IP geolocation verilerini belgele
- [ ] Her üç veri kaynağı arasındaki alan eşleştirmelerini kontrol et ve doğrula

### 1.2 Veri Dönüşüm Mapping'ini Tanımla
- [ ] ArioSDK verilerinden API Gateway Explorer formatına dönüşüm kurallarını detaylandır
- [ ] Aşağıdaki field mapping'lerini kod içinde implement et:
  - `settings.label` → `Label`
  - `settings.protocol + "://" + settings.fqdn + ":" + settings.port` → `Address`
  - `gatewayAddress` → `Owner Wallet`
  - `observerAddress` → `Observer Wallet`
  - `settings.properties` → `Properties ID`
  - `status` → `Status`
  - `settings.note` → `Note`
  - `settings.autoStake` → `Reward Auto Stake` (true/false → Enabled/Disabled)
  - `settings.allowDelegatedStaking` → `Delegated Staking` (true/false → Enabled/Disabled)
  - `settings.delegateRewardShareRatio` → `Reward Share Ratio` (0 → "0%")
  - `settings.minDelegatedStake` → `Minimum Delegated Stake (ARIO)` (6 sıfır atılacak)

## 2. Veri Servis Katmanı Geliştirme

### 2.1 Gateway Data Service Oluştur
- [ ] `GatewayDataService` sınıfı veya service function'ı oluştur
- [ ] ArioSDK'dan `getGateways` fonksiyonunu çağıran method implement et
- [ ] IP geolocation verilerini `ipgeo_gatewayexplorer.permagate.io`'dan çeken method implement et
- [ ] Her iki veri kaynağını birleştiren ana integration function'ı yaz

### 2.2 Veri Dönüşüm Fonksiyonları
- [ ] `transformArioToApiFormat(ariosdk_data, ipgeo_data)` fonksiyonu oluştur
- [ ] Address field'ını protocol, fqdn ve port'tan oluşturan helper function yaz
- [ ] Boolean değerleri Enabled/Disabled'a çeviren helper function yaz
- [ ] Stake miktarını (6 sıfır atarak) formatlayan helper function yaz
- [ ] Reward share ratio'yu yüzde formatına çeviren helper function yaz

### 2.3 Error Handling ve Fallback
- [ ] ArioSDK çağrısı başarısız olursa error handling implement et
- [ ] IP geolocation servisi çağrısı başarısız olursa fallback mekanizması ekle
- [ ] Veri dönüşümü sırasında missing field'lar için default değerler tanımla
- [ ] Network timeout ve retry mekanizması ekle

## 3. API Integration Layer

### 3.1 Gateway Info ve Healthcheck Endpoints
- [ ] `<Address>/ar-io/info` endpoint'ini çağıran function yaz
- [ ] `<Address>/ar-io/healthcheck` endpoint'ini çağıran function yaz
- [ ] Bu endpoint'lerin response formatını handle eden parser function'ları yaz
- [ ] Timeout ve error handling mekanizmaları ekle

### 3.2 Dinamik Veri Yükleme
- [ ] Harita/graf üzerinde node'a tıklanınca info verilerini çeken function implement et
- [ ] Healthcheck verilerini çeken function implement et
- [ ] Loading state'lerini handle eden UI component'ları hazırla
- [ ] Cache mekanizması ekle (aynı node'a tekrar tıklanınca API'ye tekrar gitmesin)

## 4. UI/UX Güncellemeleri

### 4.1 Sayfa Yükleme Süreci
- [ ] Sayfa açılır açılmaz `getGateways` fonksiyonunu çağıran initialization code yaz
- [ ] Loading spinner/skeleton ekranı tasarla ve implement et
- [ ] Veri yükleme progress indicator'ı ekle
- [ ] Error state için user-friendly error mesajları hazırla

### 4.2 Harita/Graf Interaction
- [ ] Node'a tıklanınca popup/modal açan event handler'ları güncelle
- [ ] Info ve healthcheck verilerini gösteren UI component'ları tasarla
- [ ] Popup içinde loading state'leri handle et
- [ ] Node'ların durumuna göre (online/offline) farklı görsel indicator'lar ekle

## 5. Performance Optimizasyonu

### 5.1 Veri Yükleme Optimizasyonu
- [ ] Initial load sırasında sadece temel gateway listesini yükle
- [ ] Info ve healthcheck verilerini lazy loading ile yükle
- [ ] API call'larını batch'le (mümkünse birden fazla gateway'i tek request'te)
- [ ] Client-side caching stratejisi implement et

### 5.2 Memory Management
- [ ] Büyük veri setleri için memory usage'ı optimize et
- [ ] Unused data'yı temizleyen cleanup function'ları ekle
- [ ] Event listener'ları properly cleanup et

## 6. Testing ve Validation

### 6.1 Unit Tests
- [ ] Veri dönüşüm function'ları için unit test yaz
- [ ] API integration function'ları için unit test yaz
- [ ] Error handling scenarios için test case'ler yaz
- [ ] Edge case'ler için test coverage ekle

### 6.2 Integration Tests
- [ ] End-to-end veri akışını test et
- [ ] Farklı network condition'larında test et
- [ ] Large dataset'ler ile performance test yap
- [ ] Cross-browser compatibility test et

## 7. Deployment ve Monitoring

### 7.1 Deployment Hazırlığı
- [ ] Production environment'da test et
- [ ] API endpoint'lerin production'da çalıştığını doğrula
- [ ] Fallback mekanizmalarının çalıştığını test et
- [ ] Performance metrics'leri monitor et

### 7.2 Monitoring ve Alerting
- [ ] API call success/failure rate'lerini monitor et
- [ ] Response time'ları track et
- [ ] Error rate'leri için alert threshold'ları belirle
- [ ] User experience metrics'leri ekle

## 8. Documentation ve Maintenance

### 8.1 Code Documentation
- [ ] API integration code'unu comment'le
- [ ] Veri dönüşüm logic'ini dokümante et
- [ ] Configuration parametrelerini belgele
- [ ] Troubleshooting guide hazırla

### 8.2 Maintenance Plan
- [ ] ArioSDK version update'leri için plan hazırla
- [ ] API schema değişiklikleri için backward compatibility planı yap
- [ ] Regular health check ve monitoring routine'i belirle
- [ ] Incident response plan hazırla

## 9. Özel Gereksinimler

### 9.1 IP Geolocation Integration
- [ ] `ipgeo_gatewayexplorer.permagate.io` servisini tamamen devre dışı bırakmama
- [ ] Address field'ını manuel olarak handle etme mekanizması
- [ ] IP geolocation verilerini ArioSDK verileri ile merge etme logic'i

### 9.2 Data Format Compatibility
- [ ] Mevcut frontend component'larının yeni veri formatıyla uyumlu olduğunu kontrol et
- [ ] Gerekirse frontend component'larını güncelle
- [ ] Backward compatibility için transition period planı hazırla

## 10. Risk Mitigation

### 10.1 Service Availability
- [ ] ArioSDK servisi down olursa fallback plan
- [ ] IP geolocation servisi down olursa fallback plan
- [ ] Primary API failing durumunda old API'ye fallback mekanizması
- [ ] Circuit breaker pattern implement et

### 10.2 Data Integrity
- [ ] Veri dönüşümü sırasında data loss olmadığını validate et
- [ ] Critical field'ların eksik olmadığını kontrol et
- [ ] Data validation rules implement et
- [ ] Anomaly detection mekanizması ekle