// Product data types and constants

export interface Product {
    id: number;
    slug: string;
    img: string;
    thumbnails: string[];
    title: {
        id: string;
        en: string;
    };
    price: string;
    priceNumeric: number;
    description: {
        id: string;
        en: string;
    };
    condition: {
        id: string;
        en: string;
    };
    minOrder: {
        id: string;
        en: string;
    };
    category: {
        id: string;
        en: string;
    };
}

export const products: Product[] = [
    {
        id: 1,
        slug: 'standard-patient-lift-sling',
        img: '/Product1.webp',
        thumbnails: ['/Product1.webp', '/standar/foto2.jpg', '/standar/foto3.jpg'],
        title: {
            id: 'Standard Patient Lift Sling',
            en: 'Standard Patient Lift Sling'
        },
        price: 'Rp 2.200.000,00',
        priceNumeric: 2200000,
        description: {
            id: `Sling Standar - Cocok untuk Berbagai Kebutuhan Transfer

Gendongan standar cocok untuk hampir semua keperluan. Gendongan ini paling umum digunakan untuk kebutuhan transfer umum, kuat, dan tahan lama.

Bahan Berkualitas Tinggi:
• Bahan nilon tebal dengan jahitan ganda
• Kain rajutan nilon tebal, mudah dirawat
• Body harness yang dapat digunakan kembali dan mudah dibersihkan
• Dapat dicuci dengan mesin dan dikeringkan dengan suhu rendah
• Terbuat dari serat nilon berkualitas tinggi.

Fitur Dukungan:
• Dukungan punggung dan paha yang baik
• Dilengkapi dengan loop warna-warni untuk berbagai posisi duduk
• Gendongan transfer LifeAid adalah gendongan serbaguna yang menyediakan akses untuk mandi dan buang air, serta menawarkan dukungan punggung dan paha yang baik.`,
            en: `Standard Sling - Suitable for Various Transfer Needs

Standard slings are suitable for almost all purposes. They are most commonly used for general transfer needs, are strong, and durable.

High-Quality Material:
• Thick nylon material with double stitching
• Thick knitted nylon fabric, easy to care for
• Reusable and easy-to-clean body harness
• Machine washable and tumble dry low
• Made from high-quality nylon fibers.

Support Features:
• Good back and thigh support
• Equipped with colorful loops for various sitting positions
• LifeAid transfer slings are versatile slings that provide access for bathing and toileting, as well as offering good back and thigh support.`
        },
        condition: {
            id: 'Baru',
            en: 'New'
        },
        minOrder: {
            id: '1 Buah',
            en: '1 Unit'
        },
        category: {
            id: 'Aksesori Lift Pasien',
            en: 'Patient Lift Accessories'
        }
    },
    {
        id: 2,
        slug: 'premium-electric-lift-sling',
        img: '/Product2.webp',
        thumbnails: ['/Product2.webp', '/premium/foto2.webp', '/premium/foto3.webp'],
        title: {
            id: 'Premium Electric Lift Sling',
            en: 'Premium Electric Lift Sling'
        },
        price: 'Rp 3.000.000,00',
        priceNumeric: 3000000,
        description: {
            id: `Sling Premium untuk Pengangkat Pasien Elektrik

Gendongan premium untuk Electric Patient Lift. Terbuat dari kain jala poliester tebal dan premium yang memberikan topangan lebih baik dan nyaman dipakai.

Fitur Utama:
• Jahitan Kuat - Setiap sudut diperkuat agar lebih tahan lama; jahitan yang diperkuat dapat menahan beban hingga 315 kg.
• Tali Nilon yang Diperkuat - Mampu menahan beban hingga 225 kg, membuatnya ideal untuk penggunaan bariatrik dan rutin.
• Dukungan Punggung Premium - Dilengkapi dengan bantalan EVA dan papan akrilik yang kokoh untuk memberikan dukungan dan kenyamanan ekstra pada area punggung.
• Bantalan Kaki Ekstra Nyaman - Bantalan udara jala lembut berlapis ganda di bawah kaki memberikan kenyamanan superior dan mengurangi tekanan selama pengangkatan.`,
            en: `Premium Sling for Electric Patient Lift

Premium sling for Electric Patient Lift. Made from thick and premium polyester mesh fabric that provides better support and is comfortable to wear.

Key Features:
• Strong Stitching - Every corner is reinforced for durability; reinforced stitching can withstand loads up to 315 kg.
• Reinforced Nylon Straps - Capable of withstanding loads up to 225 kg, making it ideal for bariatric and routine use.
• Premium Back Support - Equipped with EVA padding and sturdy acrylic board to provide extra support and comfort to the back area.
• Extra Comfortable Leg Padding - Double-layered soft mesh air cushion under the legs provides superior comfort and reduces pressure during lifting.`
        },
        condition: {
            id: 'Baru',
            en: 'New'
        },
        minOrder: {
            id: '1 Buah',
            en: '1 Unit'
        },
        category: {
            id: 'Aksesori Lift Pasien Premium',
            en: 'Premium Patient Lift Accessories'
        }
    },
    {
        id: 3,
        slug: 'electric-patient-lift-battery',
        img: '/Product3.webp',
        thumbnails: ['/Product3.webp'],
        title: {
            id: 'Electric Patient Lift Battery',
            en: 'Electric Patient Lift Battery'
        },
        price: 'Rp 3.500.000,00',
        priceNumeric: 3500000,
        description: {
            id: 'Electric Patient Lift Battery adalah baterai berkapasitas tinggi yang dirancang khusus untuk lift pasien elektrik. Dengan daya tahan lama dan sistem pengisian cepat, baterai ini memastikan lift Anda selalu siap digunakan kapan saja. Dilengkapi dengan indikator daya dan sistem proteksi overcharge. Ini hanya baterainya saja, lift pasien dijual terpisah.',
            en: 'Electric Patient Lift Battery is a high-capacity battery specifically designed for electric patient lifts. With long-lasting power and fast charging system, this battery ensures your lift is always ready to use. Equipped with power indicator and overcharge protection system. This is for the battery only; the patient lift is sold separately.'
        },
        condition: {
            id: 'Baru',
            en: 'New'
        },
        minOrder: {
            id: '1 Buah',
            en: '1 Unit'
        },
        category: {
            id: 'Baterai & Power Supply',
            en: 'Battery & Power Supply'
        }
    },
    {
        id: 4,
        slug: 'walking-sling-for-electric-lift',
        img: '/Product4.webp',
        thumbnails: ['/Product4.webp', '/walking/foto2.webp', '/walking/foto3.webp', '/walking/foto4.webp'],
        title: {
            id: 'Walking Sling for Electric Lift',
            en: 'Walking Sling for Electric Lift'
        },
        price: 'Rp 2.200.000,00',
        priceNumeric: 2200000,
        description: {
            id: 'Walking Sling - Dukungan Aman untuk Kembali Bergerak. Dirancang khusus untuk membantu pasien dalam sesi latihan berdiri dan berjalan (ambulasi) menggunakan lift pasien elektrik. Sling ini memberikan keamanan dan dukungan yang dibutuhkan pasien untuk membangun kembali kekuatan, keseimbangan, dan kepercayaan diri.',
            en: 'Walking Sling - Safe Support for Getting Moving Again. Specially designed to assist patients in standing and walking (ambulation) training sessions using an electric patient lift. This sling provides the security and support patients need to rebuild strength, balance, and confidence.'
        },
        condition: {
            id: 'Baru',
            en: 'New'
        },
        minOrder: {
            id: '1 Buah',
            en: '1 Unit'
        },
        category: {
            id: 'Aksesori Rehabilitasi',
            en: 'Rehabilitation Accessories'
        }
    },
    {
        id: 5,
        slug: 'electric-patient-lifter',
        img: '/Productdetail.webp',
        thumbnails: ['/Product.webp', '/produk5/foto2.avif', '/produk5/foto3.avif', '/produk5/foto4.webp'],
        title: {
            id: 'Electric Patient Lifter',
            en: 'Electric Patient Lifter'
        },
        price: 'Rp 24.000.000,00',
        priceNumeric: 24000000,
        description: {
            id: `Alat Pengangkat Pasien Elektrik - Alat Bantu Angkat Pasien

Electric Patient Lifter adalah alat bantu angkat yang aman bagi pasien stroke atau lumpuh, dirancang untuk memindahkan mereka dari tempat tidur ke kursi roda, mobil, atau bak mandi untuk kebutuhan sehari-hari. 
Fitur Utama:
• Ditenagai oleh baterai yang dapat diisi ulang
• Sangat kokoh, terbuat dari baja berkualitas tinggi

Spesifikasi Produk:
Ukuran: 1750×1200×620mm
Bahan: Baja Kuat Berlapis Serbuk
Rentang Angkat: 450mm-1670mm
Kecepatan Angkat: 3,8 mm/detik
Beban Maksimum: 180kg
Berat Produk: 45kg
Motor: Aktuator Linier 24V/8000N (Taiwan MOTECK)
Baterai: 60-80 penggunaan per pengisian daya

Cocok untuk:
• Pengguna kursi roda
• Individu yang mengalami obesitas
• Pasien terbaring di tempat tidur
• Individu penyandang disabilitas, penyandang cacat
• Pasien dengan fraktur tungkai bawah
• Lansia dengan keterbatasan kemampuan berjalan`,
            en: `Electric Patient Lifter - Patient Lifting Aid

The Electric Patient Lifter is a safe lifting aid for stroke or paralyzed patients, designed to move them from bed to wheelchair, car, or bathtub for daily needs.
Key Features:
• Powered by a rechargeable battery
• Very sturdy, made of high-quality steel

Product Specifications:
Dimensions: 1750×1200×620mm
Material: Strong Powder-Coated Steel
Lifting Range: 450mm-1670mm
Lifting Speed: 3.8 mm/second
Maximum Load: 180kg
Product Weight: 45kg
Motor: 24V/8000N Linear Actuator (Taiwan MOTECK)
Battery: 60-80 uses per charge

Suitable for:
• Wheelchair users
• Individuals with obesity
• Bedridden patients
• Individuals with disabilities, handicapped
• Patients with lower limb fractures
• Elderly with limited walking ability`
        },
        condition: {
            id: 'Baru',
            en: 'New'
        },
        minOrder: {
            id: '1 Unit',
            en: '1 Unit'
        },
        category: {
            id: 'Lift Pasien Elektrik',
            en: 'Electric Patient Lift'
        }
    }
];

export const getProductById = (id: number): Product | undefined => {
    return products.find(product => product.id === id);
};

export const getProductBySlug = (slug: string): Product | undefined => {
    return products.find(product => product.slug === slug);
};
