import React, { memo } from "react";
import Image from "next/image";
import UCASSLogo from "../../../public/ucass_logo.png";

/**
 * EmptyState component displayed when there are no messages
 * 
 * Shows a branded splash screen with the laboratory logo and name
 */
const EmptyState = memo(() => (
  <div className="w-full h-full flex justify-center items-center" aria-label="Empty chat state">
    <div className="flex flex-col gap-4 items-center">
      <Image
        src={UCASSLogo}
        alt="计算社会科学与国家治理实验室 Logo"
        width={225}
        height={200}
        draggable={false}
        priority
        className="object-contain select-none"
      />
      <p className="text-center select-none text-xl bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-900">
        计算社会科学与国家治理实验室
      </p>
    </div>
  </div>
));

EmptyState.displayName = "EmptyState";

export default EmptyState;
