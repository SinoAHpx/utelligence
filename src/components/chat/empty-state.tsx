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
        width={225}
        height={200}
        draggable="false"
        className="object-contain select-none"
      />
      <p className="text-center select-none text-xl bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-900">
        计算社会科学与国家治理实验室
      </p>
    </div>
  </div>
);

export default EmptyState;
