import Image from "next/image";
import PlansLogo from "../../../../public/images/svg/plans-logo.svg";
import WalletImage from "../../../../public/images/wallet-image.webp";
import Framers from "../../../../public/images/svg/farmers.svg";
import Progressive from "../../../../public/images/svg/progressive.svg";
import Geico from "../../../../public/images/svg/geico.svg";
import StateFarm from "../../../../public/images/svg/statefarm.svg";
import Coverage from "../../../../public/images/svg/cover-wallet.svg";

const WelcomeScreen = () => {
  return (
    <div className="bg-[url('/images/svg/bg-vector.svg')] bg-contain bg-no-repeat bg-bottom  bg-[#FFF7ED] h-screen ">
      <div className="w-full max-w-110 mx-auto flex flex-col items-center pt-30.5 h-screen">
        <Image src={PlansLogo} alt="Plans Logo" width={118} height={48} />
        <p className="text-accent-foreground text-5xl leading-9 tracking-4 text-center pt-4 pb-8 font-medium">
          Manage All Your Insurance Policies at One Place
        </p>
        <Image src={WalletImage} alt="Wallet Image" width={476} height={515} />
        <div className="wrapper absolute bottom-10 flex gap-(--gap) m-auto max-w-screen">
          <div className="marquee flex overflow-hidden select-none gap-(--gap)">
            <div className="marquee__group shrink-0 flex items-center justify-around gap-(--gap) min-w-full animate-scroll-x">
              <Image src={Framers} alt="Framers" width={160} height={32} />
              <Image src={Progressive} alt="Framers" width={160} height={32} />
              <Image src={Geico} alt="Framers" width={110} height={32} />
              <Image src={StateFarm} alt="Framers" width={150} height={32} />
              <Image src={Coverage} alt="Framers" width={160} height={32} />
            </div>
            <div
              aria-hidden="true"
              className="marquee__group shrink-0 flex items-center justify-around gap-(--gap) min-w-full animate-scroll-x"
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
