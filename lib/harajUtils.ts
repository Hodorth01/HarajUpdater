import axios from 'axios';

export async function extractRealPostId(inputUrl: string): Promise<string | null> {
  try {
    const res = await axios.get(inputUrl, {
      maxRedirects: 5,
      headers: {
        // User-Agent مهم جداً ليوهم حراج أن الطلب من متصفح حقيقي
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    // 1. نبحث في الرابط النهائي (إذا نجح التحويل)
    const finalUrl = res.request?.res?.responseUrl || '';
    const urlMatch = finalUrl.match(/(?:\/|ads\/)(\d{10,11})/);
    if (urlMatch) return urlMatch[1];

    // 2. نبحث داخل الـ HTML (إذا لم ينجح التحويل وبقينا في صفحة shared-post)
    // حراج يضع الرابط الأصلي في وسم <link rel="canonical" href="...">
    const html = res.data;
    const canonicalMatch = html.match(/haraj\.com\.sa\/(\d{10,11})/);
    if (canonicalMatch) return canonicalMatch[1];

    // 3. بحث أخير عن أي تسلسل أرقام طويل يشبه معرفات حراج
    const generalMatch = html.match(/"id":\s*(\d{10,11})/) || html.match(/post\/(\d{10,11})/);
    return generalMatch ? generalMatch[1] : null;

  } catch (e) {
    console.error('Failed to resolve shared-post:', inputUrl);
    return null;
  }
}