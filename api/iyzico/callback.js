export default async function handler(req, res) {
  // iyzico callback burada ödeme sonucunu post eder.
  // Burada: token ile retrieve yapıp (iyzico endpoint) status OK ise siparişi kaydedip Printify order yaratacağız.
  return res.status(200).send("OK");
}
