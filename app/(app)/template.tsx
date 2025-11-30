import Header from "@/components/header";

function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="overflow-hidden">
      <Header />
      <div className="mt-26 w-full max-w-[1080px] sm:mb-0 mb-15 mx-auto ">
        {children}
      </div>


    </div>
  );
}
export default AppLayout;
