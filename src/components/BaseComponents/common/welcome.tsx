import Image from "next/image";
import WalletImage from "../../../../public/images/wallet-image.webp";
import Framers from "../../../../public/images/svg/farmers.svg";
import Progressive from "../../../../public/images/svg/progressive.svg";
import Geico from "../../../../public/images/svg/geico.svg";
import StateFarm from "../../../../public/images/svg/statefarm.svg";
import Coverage from "../../../../public/images/svg/cover-wallet.svg";
import { PlansLogo } from "@/components/BaseComponents/common/plans-logo";

const WelcomeScreen = () => {
  return (
    <div className="h-screen bg-orange-50 bg-welcome bg-contain bg-bottom bg-no-repeat dark:bg-card">
      <div className="mx-auto flex h-screen w-full max-w-110 flex-col items-center pt-30.5">
        <PlansLogo width={118} height={48} alt="Plans Logo" />
        <p className="pt-4 pb-8 text-center text-5xl leading-9 font-medium tracking-4 text-accent-foreground">
          Manage All Your Insurance Policies at One Place
        </p>
        <Image src={WalletImage} alt="Wallet Image" width={476} height={515} />
        <div className="wrapper absolute bottom-10 m-auto flex max-w-screen gap-(--gap)">
          <div className="marquee flex gap-(--gap) overflow-hidden select-none">
            <div className="marquee__group flex min-w-full shrink-0 animate-scroll-x items-center justify-around gap-(--gap)">
              <Image src={Framers} alt="Framers" width={160} height={32} />
              <Image src={Progressive} alt="Framers" width={160} height={32} />
              <Image src={Geico} alt="Framers" width={110} height={32} />
              <Image src={StateFarm} alt="Framers" width={150} height={32} />
              <Image src={Coverage} alt="Framers" width={160} height={32} />
            </div>
            <div
              aria-hidden="true"
              className="marquee__group flex min-w-full shrink-0 animate-scroll-x items-center justify-around gap-(--gap)"
            >
              <Image src={Framers} alt="Framers" width={160} height={32} />
              <Image src={Progressive} alt="Framers" width={160} height={32} />
              <Image src={Geico} alt="Framers" width={110} height={32} />
              <Image src={StateFarm} alt="Framers" width={150} height={32} />
              <Image src={Coverage} alt="Framers" width={160} height={32} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
