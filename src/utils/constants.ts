// Bangladesh 64 Districts for Checkout and Delivery
export const BD_DISTRICTS = [
  'ঢাকা (Dhaka)',
  'চট্টগ্রাম (Chattogram)',
  'সিলেট (Sylhet)',
  'রাজশাহী (Rajshahi)',
  'খুলনা (Khulna)',
  'বরিশাল (Barishal)',
  'রংপুর (Rangpur)',
  'ময়মনসিংহ (Mymensingh)',
  'কুমিল্লা (Cumilla)',
  'গাজীপুর (Gazipur)',
  'নারায়ণগঞ্জ (Narayanganj)',
  'বগুড়া (Bogura)',
  'কক্সবাজার (Cox\'s Bazar)',
  'দিনাজপুর (Dinajpur)',
  'ফরিদপুর (Faridpur)',
  'যশোর (Jashore)',
  'পাবনা (Pabna)',
  'টাঙ্গাইল (Tangail)',
  'কিশোরগঞ্জ (Kishoreganj)',
  'ব্রাহ্মণবাড়িয়া (Brahmanbaria)',
  'নোয়াখালী (Noakhali)',
  'ফেনী (Feni)',
  'চাঁদপুর (Chandpur)',
  'লক্ষ্মীপুর (Lakshmipur)',
  'বাগেরহাট (Bagerhat)',
  'চুয়াডাঙ্গা (Chuadanga)',
  'কুষ্টিয়া (Kushtia)',
  'মাগুরা (Magura)',
  'মেহেরপুর (Meherpur)',
  'নড়াইল (Narail)',
  'সাতক্ষীরা (Satkhira)',
  'ঝিনাইদহ (Jhenaidah)',
  'পটুয়াখালী (Patuakhali)',
  'ভোলা (Bhola)',
  'পিরোজপুর (Pirojpur)',
  'ঝালকাঠি (Jhalakathi)',
  'বরগুনা (Barguna)',
  'সিরাজগঞ্জ (Sirajganj)',
  'নাটোর (Natore)',
  'নওগাঁ (Naogaon)',
  'চাঁপাইনবাবগঞ্জ (Chapai Nawabganj)',
  'জয়পুরহাট (Joypurhat)',
  'কুড়িগ্রাম (Kurigram)',
  'গাইবান্ধা (Gaibandha)',
  'লালমনিরহাট (Lalmonirhat)',
  'নীলফামারী (Nilphamari)',
  'পঞ্চগড় (Panchagarh)',
  'ঠাকুরগাঁও (Thakurgaon)',
  'হবিগঞ্জ (Habiganj)',
  'মৌলভীবাজার (Moulvibazar)',
  'সুনামগঞ্জ (Sunamganj)',
  'শেরপুর (Sherpur)',
  'জামালপুর (Jamalpur)',
  'নেত্রকোণা (Netrokona)',
  'মানিকগঞ্জ (Manikganj)',
  'মুন্সীগঞ্জ (Munshiganj)',
  'নরসিংদী (Narsingdi)',
  'গোপালগঞ্জ (Gopalganj)',
  'মাদারীপুর (Madaripur)',
  'রাজবাড়ী (Rajbari)',
  'শরীয়তপুর (Shariatpur)',
  'বান্দরবান (Bandarban)',
  'খাগড়াছড়ি (Khagrachhari)',
  'রাঙ্গামাটি (Rangamati)',
];

export function formatBDT(amount: number): string {
  if (isNaN(amount)) return '৳ ০';
  return `৳ ${amount.toLocaleString('en-US')}`;
}

export function formatDateBD(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
