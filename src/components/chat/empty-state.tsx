import React from "react";
import Image from "next/image";
import UCASSLogo from "../../../public/ucass_logo.png";

/**
 * Empty state component displayed when there are no messages
 */
const EmptyState = () => (
  <div className="w-full h-full flex justify-center items-center">
    <div className="flex flex-col gap-4 items-center">
      <Image
        src={UCASSLogo}
        alt="AI"
        width={450}
        height={400}
        draggable="false"
        className="object-contain dark:invert"
      />
      <p className="text-center text-xl text-muted-foreground">
        祝你早安, 午安, 晚安。
      </p>
    </div>
  </div>
);

export default EmptyState;
