import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  // Wikipedia/Info Links found via search:
  const cricketerData = [
    {
      name: "Arjuna Ranatunga",
      text: "1996 World Cup Winning Captain.",
      action: "View Wikipedia",
      image: "/ArjunR.jpg",
      // Snippet 1.1: Arjuna Ranatunga Wikipedia
      link: "https://en.wikipedia.org/wiki/Arjuna_Ranatunga",
    },
    {
      name: "Sanath Jayasuriya",
      text: "Legendary All-rounder. Listen to his endorsement.",
      action: "Listen to SLC Info",
      image: "/Sanathj.jpg",
      // Using a general YouTube search for relevant SLC/Cricket audio if a specific endorsement isn't available
      link: "https://www.youtube.com/results?search_query=Sanath+Jayasuriya+Sri+Lanka+Cricket+interview",
    },
    {
      name: "Upul Tharanga",
      text: "Successful Opening Batsman.",
      action: "View Wikipedia",
      image: "/UTharanga.png",
      // Snippet 3.2: Upul Tharanga Wikipedia
      link: "https://en.wikipedia.org/wiki/Upul_Tharanga",
    },
    {
      name: "Shammi de Silva",
      text: "President, Sri Lanka Cricket.",
      action: "View SLC Info",
      image: "/shammis.jpg",
      // Snippet 4.1: Shammi Silva Wikipedia
      link: "https://en.wikipedia.org/wiki/Shammi_Silva",
    },
    {
      name: "Lasith Malinga",
      text: "Pace Bowling Icon.",
      action: "View Wikipedia",
      image: "/Lmalinga.jpg",
      // Snippet 5.2: Lasith Malinga Wikipedia
      link: "https://en.wikipedia.org/wiki/Lasith_Malinga",
    },
  ];

  // UPDATED: Changed image paths to be non-transparent placeholders
  const talentResources = [
    {
      href: "/gallery",
      icon: "",
      text: "GALLERY & HIGHLIGHTS",
      image: "/Ga.png", // New Placeholder
    },
    {
      href: "/laws",
      icon: "",
      text: "LAWS OF CRICKET",
      image: "/lows.png", // New Placeholder
    },
    {
      href: "/news",
      icon: "",
      text: "NEWS & ARTICLES",
      image: "/news*.png", // New Placeholder
    },
    {
      href: "/introduction",
      icon: "",
      text: "INTRODUCTION THEORY",
      image: "/intro.png", // New Placeholder
    },
    {
      href: "/achievements",
      icon: "",
      text: "ACHIEVEMENTS & RECORDS",
      image: "/achiv.png", // New Placeholder
    },
    {
      href: "/ai-bot",
      icon: "",
      text: "AI ASSISTANT (COACH BOT)",
      image: "/AI.png", // New Placeholder
    },
  ];

  return (
    <div className="text-white bg-[#020b16]">
      {/* ---------------------- HERO SECTION ---------------------- */}
      <section className="pt-28 pb-20 text-center max-w-4xl mx-auto px-4">
        <div className="flex justify-center mb-6">
          <Image
            src="/image55.png" // place your logo in /public/logo.png
            alt="Path of the Cricketer Logo"
            width={160}
            height={160}
            // Logo Image: Border thickness is border-4
            className="rounded-full border-0 border-yellow-400 p-2"
          />
        </div>

        {/* Change 1: Reduced boldness from font-extrabold to font-bold */}
        <h1 className="text-4xl md:text-4xl font-bold text-yellow-400 leading-tight">
          PATH OF THE CRICKET <br />
          THE NATIONAL TALENT PORTAL
        </h1>

        <p className="text-gray-300 mt-5 leading-relaxed text-lg">
          Unearthing Sri Lanka's Next Generation of Cricket Heroes. We provide a
          professional platform for scouting, development, and real-time performance
          tracking for aspiring national players.
        </p>

        {/* REQUIREMENTS CARD */}
        <div className="bg-black/40 border border-yellow-400 mt-10 rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="text-yellow-300 font-semibold text-lg mb-3 flex items-center gap-2">
            <span>🧩</span> BEGIN YOUR JOURNEY: JOINING REQUIREMENTS
          </h3>

          <ul className="text-gray-300 text-sm space-y-2 text-left">
            <li>✔ Pre-Registration: Submit basic details (Name, District, DOB).</li>
            <li>✔ District Selection: Must pass the preliminary trial for your district.</li>
            <li>
              ✔ Full Profile: Selected players can create complete profiles
              (Cricket Stats, Personal Details, Bio).
            </li>
            <li>✔ Compliance: Must follow Sri Lanka Cricket board regulations.</li>
          </ul>

          <div className="text-center">
            <Link
              href="/user-profile"
              className="mt-8 inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg"
            >
              ✨ REGISTER FOR DISTRICT SELECTION NOW
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------- TALENT DEVELOPMENT RESOURCES ---------------------- */}
      <section className="py-20 bg-[#04101f]">
        <h2 className="text-center text-yellow-400 text-xl font-bold mb-12">
           Talent Development Resources
        </h2>

        {/* Talent Development Resources: Single Row (md:grid-cols-6) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 gap-5 max-w-6xl mx-auto px-2">
          {talentResources.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="group relative flex flex-col items-center justify-center p-2 h-28 text-center rounded-3xl border-1 border-blue-700 transition-all duration-300 bg-[#0e2c4d] hover:bg-yellow-400/20 hover:shadow-xl hover:shadow-yellow-400/20 overflow-hidden"
            >
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.text}
                  layout="fill"
                  objectFit="cover"
                  // UPDATED: Removed opacity class to make the image solid
                  className="absolute inset-0 transition-opacity duration-300 z-0"
                />
              )}
              <div className="relative z-12 flex flex-col items-center justify-center h-full">
                <div className="text-3xl mb-1">{item.icon}</div>
                <p className="text-2xs font-bold leading-snug group-hover:text-yellow-200">
                  {item.text}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------------- SEARCH PORTAL ---------------------- */}
      <section className="py-16 text-center max-w-4xl mx-auto px-4">
        <h2 className="text-yellow-400 text-2xl font-bold mb-6">
          PATH OF THE CRICKET SEARCH PORTAL
        </h2>

        <div className="flex justify-center gap-2">
          <input
            type="text"
            placeholder="Search for Gallery, News, Players, Join..."
            className="w-full md:w-96 px-4 py-2 rounded bg-[#0b1c2f] border border-gray-700 text-white"
          />
          <button className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold">
            Search
          </button>
        </div>

        <div className="flex gap-3 justify-center mt-4 text-sm text-gray-300 flex-wrap">
          {["Gallery", "News", "Practice", "Selection", "User Profiles", "Ranking"].map(
            (tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-800 rounded-full">
                {tag}
              </span>
            )
          )}
        </div>
      </section>

      {/* ---------------------- VOICES OF SRI LANKAN CRICKET ---------------------- */}
      {/* Change 3: Added an outer border and padding to the whole section container */}
      <section className="py-16 bg-[#030e1c] border-t border-b border-gray-400">
        <h2 className="text-center text-yellow-400 text-2xl font-bold mb-10">
          🎙 Voices of Sri Lankan Cricket
        </h2>

        <div
          className="grid grid-cols-5 md:grid-cols-5 gap-5 px-5 max-w-7xl mx-auto"
        >
          {cricketerData.map((p, i) => (
            <div
              key={i}
              className="bg-[#0e2c4d] p-6 rounded-lg border border-green-600 shadow-10xl shadow-green/30 text-center hover:bg-[#113a64] transition-all duration-300"
            >
              {/* Image Placeholder with Reduced Height */}
              <div className="relative w-full h-40 mb-3 rounded overflow-hidden">
                <Image
                  src={p.image} // Use the specific image path
                  alt={p.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded"
                />
              </div>
              <h3 className="font-bold text-whitemtext-base">{p.name}</h3>
              <p className="text-gray-400 text-xs mt-2">{p.text}</p>

              {/* Change 4: Connect yellow button to the specific link */}
              <Link
                href={p.link}
                target="_blank" // Open in a new tab
                rel="noopener noreferrer" // Security best practice
                className="mt-5 inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded font-semibold text-xs transition-colors"
              >
                {p.action}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------- OFFER YOUR EXPERTISE ---------------------- */}
      <section className="py-24 text-center">
        {" "}
        {/* Professional Service Portal: Increased padding (py-24) */}
        <h2 className="text-yellow-400 text-2xl font-bold mb-4">
          Ready to Offer Your Expertise?
        </h2>
        <p className="text-gray-300 mb-8">
          {" "}
          {/* Professional Service Portal: Increased margin (mb-8) */}
          Join our network of coaches, scouts, analysts, and physiotherapists.
        </p>
        <Link
        
          href="/about-us"
          className="inline-block bg-yellow-500 hover:bg-yellow-100 text-black px-6 py-3 rounded-lg font-semibold"
        >
          🧩 PROFESSIONAL SERVICE PORTAL ACCESS
        </Link>
      </section>
    </div>
  );
}