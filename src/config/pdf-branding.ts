/**
 * Single Source of Truth for Institutional PDF Branding
 * "Locked" specifications for headers, lines, and signatures.
 */

export const PDF_BRANDING = {
    // Institution Labels
    institution: {
        name: "ANDALUS MODERN ACADEMY",
        subtitle: "Standardized PPDB Template for Modern Institutions",
        committee: "PANITIA PENERIMAAN SANTRI BARU",
        academic_year: "2026-2027",
        address: "Jl. Al Andalus Raya No. 1, Kota Madani",
        contact: "Website: https://ppdb-demo.vercel.app | Email: demo@alandalus.com",
        phones: "WhatsApp: 0800-0000-0000", // Base phone
    },

    // Resource Paths
    assets: {
        logo: "/images/logo.png",
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
        name: "Dr. Al Andalus",
        role: "Mudir",
        city: "Kota Madani"
    }
};
