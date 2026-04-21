/**
 * Single Source of Truth for Institutional PDF Branding
 * "Locked" specifications for headers, lines, and signatures.
 * Template Demo
 */

export const PDF_BRANDING = {
    // Institution Labels
    institution: {
        name: "PPDB MODERN DEMO SYSTEM",
        subtitle: "Demo PPDB Managed by Andalus",
        committee: "PANITIA PENERIMAAN SANTRI BARU",
        academic_year: "2026-2027",
        address: "Jl. Demo No. 123, Kota Demo, Jawa Barat 40000",
        contact: "Website: https://demo.pesantren.com | Email: info@demo.pesantren.com",
        phones: "WhatsApp: 0812-0000-xxxx",
    },

    // Resource Paths
    assets: {
        logo: "/images/kop-surat.png",
        stamp: "/images/stempel-pesantren.jpg",
        signature: "/images/ttd-mudir.png",
    },

    // Precise Coordinate Standards (jsPDF based)
    coords: {
        header: {
            logo: { x: 18, y: 11, w: 20, h: 28 },
            vertical_bar: { x1: 44, y1: 13, x2: 44, y2: 39, width: 0.2 },
            text_x: 48,
            horizontal_sep: {
                y_thick: 45,
                y_thin: 46.5,
                thickness_thick: 1.2,
                thickness_thin: 0.3
            }
        },
        signature: {
            stamp: { w: 35, h: 35 },
            ttd: { w: 35, h: 35 },
            margin_right: 80,
            y_offset_ttd: 5
        }
    },

    // Official Mudir / Authority
    authority: {
        name: "Mudir Demo System",
        role: "Mudir",
        city: "Demo City"
    }
};
