import Image from "next/image";


export function TeamCard({
  name,
  role,
  image,
  imageAlt,
  portraitClass,
  priority = false,
}: {
  name: string;
  role: string;
  image: string;
  imageAlt: string;
  portraitClass: string;
  priority?: boolean;
}) {
  return (
    <article className="group flex flex-col">

      <div className="relative aspect-6/7 w-full overflow-hidden bg-white">
        <Image
          src={image}
          alt={imageAlt}
          width={1598}
          height={1734}
          priority={priority}
          sizes="(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 22vw"

          className={`absolute transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${portraitClass}`}
        />
      </div>

      <h3 className="font-display text-menu-fg mt-8.25 text-center text-[1.5rem] leading-[1.75rem] font-semibold tracking-[-0.05em] uppercase">
        {name}
      </h3>
      <p className="text-menu-fg font-body text-body mt-0.25 text-center">{role}</p>
    </article>
  );
}
