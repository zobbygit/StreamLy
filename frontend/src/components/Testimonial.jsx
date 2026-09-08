export const Testimonial = () => {
  const cardsData = [
    {
      image:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
      name: "Alex Morgan",
      handle: "@alexmorgan",
      text: "Streamly makes jumping into a video call feel effortless. No complicated setup, just connect and talk.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
      name: "Maya Chen",
      handle: "@mayachen",
      text: "The calls are smooth, the interface is clean, and sharing a meeting link with my team takes seconds.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
      name: "Jordan Lee",
      handle: "@jordantalks",
      text: "Finally, a video calling app that doesn't get in the way. Streamly keeps everything simple and focused.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60",
      name: "Ryan Cooper",
      handle: "@ryancooper",
      text: "From quick one-on-one calls to team meetings, Streamly has become our go-to way to stay connected.",
    },
  ];

  const CreateCard = ({ card }) => (
    <div
      className="
        p-5 rounded-2xl mx-3
        w-80 shrink-0
        bg-white/60
        backdrop-blur-xl
        border border-blue-100/70
        shadow-[0_8px_30px_rgba(16,185,129,0.08)]
        hover:-translate-y-1
        hover:shadow-[0_12px_35px_rgba(16,185,129,0.14)]
        transition-all duration-300
      "
    >
      {/* User */}
      <div className="flex items-center gap-3">
        <img
          className="size-11 rounded-full object-cover ring-2 ring-white shadow-sm"
          src={card.image}
          alt={card.name}
        />

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-slate-800">
              {card.name}
            </p>

            {/* Verified */}
            <svg
              className="fill-blue-500"
              width="13"
              height="13"
              viewBox="0 0 12 12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.555.72a4 4 0 0 1-.297.24c-.179.12-.38.202-.59.244a4 4 0 0 1-.38.041c-.48.039-.721.058-.922.129a1.63 1.63 0 0 0-.992.992c-.071.2-.09.441-.129.922a4 4 0 0 1-.041.38 1.6 1.6 0 0 1-.245.59 3 3 0 0 1-.239.297c-.313.368-.47.551-.56.743-.213.444-.213.96 0 1.404.09.192.247.375.56.743.125.146.187.219.24.297.12.179.202.38.244.59.018.093.026.189.041.38.039.48.058.721.129.922.163.464.528.829.992.992.2.071.441.09.922.129.191.015.287.023.38.041.21.042.411.125.59.245.078.052.151.114.297.239.368.313.551.47.743.56.444.213.96.213 1.404 0 .192-.09.375-.247.743-.56.146-.125.219-.187.297-.24.179-.12.38-.202.59-.244a4 4 0 0 1 .38-.041c.48-.039.721-.058.922-.129.464-.163.829-.528.992-.992.071-.2.09-.441.129-.922a4 4 0 0 1 .041-.38c.042-.21.125-.411.245-.59.052-.078.114-.151.239-.297.313-.368.47-.551.56-.743.213-.444.213-.96 0-1.404-.09-.192-.247-.375-.56-.743a4 4 0 0 1-.24-.297 1.6 1.6 0 0 1-.244-.59 3 3 0 0 1-.041-.38c-.039-.48-.058-.721-.129-.922a1.63 1.63 0 0 0-.992-.992c-.2-.071-.441-.09-.922-.129a4 4 0 0 1-.38-.041 1.6 1.6 0 0 1-.59-.245A3 3 0 0 1 7.445.72C7.077.407 6.894.25 6.702.16a1.63 1.63 0 0 0-1.404 0c-.192.09-.375.247-.743.56m4.07 3.998a.488.488 0 0 0-.691-.69l-2.91 2.91-.958-.957a.488.488 0 0 0-.69.69l1.302 1.302c.19.191.5.191.69 0z"
              />
            </svg>
          </div>

          <span className="text-xs text-slate-400">
            {card.handle}
          </span>
        </div>
      </div>

      {/* Quote */}
      <div className="mt-5">
        <span className="text-3xl leading-none text-blue-300 font-serif">
          “
        </span>

        <p className="text-sm leading-6 text-slate-600 -mt-1">
          {card.text}
        </p>
      </div>

      {/* Small product indicator */}
      <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 font-medium">
        <span className="size-1.5 rounded-full bg-blue-500" />
        Streamly user
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .marquee-inner {
          animation: marqueeScroll 28s linear infinite;
        }

        .marquee-reverse {
          animation-direction: reverse;
        }

        .marquee-row:hover .marquee-inner {
          animation-play-state: paused;
        }
      `}</style>

      {/* Row 1 */}
      <div className="marquee-row w-full mx-auto max-w-6xl overflow-hidden relative">
        <div className="absolute left-0 top-0 h-full w-24 md:w-40 z-10 pointer-events-none bg-gradient-to-r from-slate-100/90 to-transparent" />

        <div className="marquee-inner flex transform-gpu min-w-[200%] py-4">
          {[...cardsData, ...cardsData].map((card, index) => (
            <CreateCard key={index} card={card} />
          ))}
        </div>

        <div className="absolute right-0 top-0 h-full w-24 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-slate-100/90 to-transparent" />
      </div>

      {/* Row 2 */}
      <div className="marquee-row w-full mx-auto max-w-6xl overflow-hidden relative">
        <div className="absolute left-0 top-0 h-full w-24 md:w-40 z-10 pointer-events-none bg-gradient-to-r from-slate-100/90 to-transparent" />

        <div className="marquee-inner marquee-reverse flex transform-gpu min-w-[200%] py-4">
          {[...cardsData, ...cardsData].map((card, index) => (
            <CreateCard key={index} card={card} />
          ))}
        </div>

        <div className="absolute right-0 top-0 h-full w-24 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-slate-100/90 to-transparent" />
      </div>
    </>
  );
};