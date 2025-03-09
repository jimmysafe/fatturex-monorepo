import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { Check, Play, Star, Zap } from "lucide-react";

import { container } from "@/lib/container";

export function Hero() {
  return (
    <section className={cn("pt-32 pb-32 md:pb-20 md:pt-40", container)}>
      <div className="container max-w-[75rem]">
        <div className="flex gap-8">
          <div className="mx-auto max-w-[50rem] lg:max-w-full">
            <h1 className="font-poppins mb-2.5 text-center text-5xl font-semibold leading-tight tracking-[-1px] sm:text-[3.375rem] md:text-[5.625rem] md:leading-[6.18rem] lg:text-left">
              Basta brutte sorprese.
            </h1>
            <p className="mb-10 text-center text-2xl font-medium leading-9 lg:text-left">
              We streamlines your ad management tasks, letting you focus on
              achieving results more quickly.
            </p>
            <div className="flex flex-col items-center justify-center gap-5 sm:flex-row lg:justify-normal">
              <Button
                variant="default"
                asChild
                className="h-fit w-full rounded-lg border-2 border-primary px-8 py-4 text-lg font-semibold sm:w-fit"
              >
                <a href="#">Try for Free</a>
              </Button>
              <Button
                variant="ghost"
                asChild
                className="h-fit w-full rounded-lg border-2 px-8 py-4 text-lg font-semibold hover:border-primary hover:bg-transparent sm:w-fit"
              >
                <a href="#">Book a Demo</a>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-7 lg:justify-normal">
              {[
                "30-day free trial",
                "No credit card required",
                "Cancel anytime",
              ].map((text, i) => (
                <div key={`${i}`} className="flex items-center gap-2">
                  <Check className="size-3 stroke-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="grid grid-cols-[repeat(2,_10.375rem)] grid-rows-[2.4375rem_7.18rem_3.187rem_7.125rem_3.75rem_4.625rem] gap-x-8 gap-y-[1.375rem] bg-[radial-gradient(closest-side_,_theme('colors.gray.300'),_theme('colors.transparent'))] bg-[length:100%_100%] bg-no-repeat">
              <div className="relative col-[1_/_2] row-[1_/_3]">
                <img
                  src="https://shadcnblocks.com/images/block/placeholder-1.svg"
                  alt=""
                  className="object-fit size-full rounded-2xl opacity-80 blur-md"
                />
                <div className="absolute bottom-0 flex min-w-60 gap-3 rounded-2xl bg-white p-3 shadow-2xl">
                  <img
                    src="https://shadcnblocks.com/images/block/avatar-1.webp"
                    alt=""
                    className="object-fit size-11 rounded-full border object-center opacity-80"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <Zap className="size-4 fill-violet-600 stroke-violet-600" />
                      <div className="text-sm font-semibold text-violet-600">
                        Rule
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Cancel low-performers
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-[2_/_3] row-[2_/_4]">
                <div className="flex size-full flex-col justify-between rounded-2xl bg-white p-2 shadow-lg">
                  <div className="size-5 rounded-full bg-black/10"></div>
                  <div className="flex h-[9.18rem] w-[9.375rem] rounded-2xl bg-[url('/images/block/placeholder-2.svg')] bg-cover bg-center bg-no-repeat">
                    <Button
                      variant="default"
                      size="icon"
                      className="m-auto flex size-10 rounded-full bg-black"
                    >
                      <Play className="m-auto fill-white" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="col-[1_/_2] row-[3_/_5]">
                <div className="flex size-full flex-col justify-between rounded-2xl bg-white p-2 shadow-lg">
                  <div className="size-5 rounded-full bg-black/10"></div>
                  <div className="flex h-[9.18rem] w-[9.375rem] rounded-2xl bg-[url('/images/block/placeholder-3.svg')] bg-cover bg-center bg-no-repeat">
                    <div className="m-2 mx-auto flex size-fit items-center gap-1 self-end rounded-xl bg-black p-2 text-white">
                      <Star className="size-4" />
                      <div className="text-xs font-semibold">
                        Used in 700 ads
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-[2_/_3] row-[4_/_-2]">
                <div className="flex size-full flex-col justify-between rounded-2xl bg-white p-4 shadow-lg">
                  <div>
                    <div className="h-2 w-4/5 rounded-2xl bg-black/10"></div>
                    <div className="mt-2 h-2 w-[50%] rounded-2xl bg-black/10"></div>
                  </div>
                  <div className="relative mx-auto size-[7.5rem]">
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 148 148"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        className="fill-violet-200"
                        d="M148 74C148 114.869 114.869 148 74 148C33.1309 148 0 114.869 0 74C0 33.1309 33.1309 0 74 0C114.869 0 148 33.1309 148 74ZM13.0735 74C13.0735 107.649 40.3512 134.926 74 134.926C107.649 134.926 134.926 107.649 134.926 74C134.926 40.3512 107.649 13.0735 74 13.0735C40.3512 13.0735 13.0735 40.3512 13.0735 74Z"
                      />
                      <path
                        className="fill-violet-400"
                        d="M74 0C90.6218 1.98213e-07 106.76 5.59609 119.813 15.8865C132.866 26.177 142.075 40.5625 145.955 56.725C149.836 72.8876 148.161 89.8859 141.203 104.981C134.244 120.076 122.405 132.388 107.595 139.934C92.7852 147.481 75.8657 149.821 59.5633 146.578C43.2609 143.335 28.5249 134.698 17.7299 122.059C6.93495 109.42 0.709615 93.5142 0.0570506 76.9052C-0.595514 60.2962 4.3627 43.9512 14.1328 30.5039L24.7069 38.1865C16.6625 49.2586 12.5801 62.7167 13.1174 76.3921C13.6547 90.0675 18.7804 103.164 27.6687 113.571C36.5571 123.977 48.6902 131.089 62.1132 133.759C75.5362 136.429 89.4672 134.502 101.661 128.289C113.856 122.075 123.603 111.938 129.333 99.5088C135.063 87.08 136.441 73.0841 133.246 59.7763C130.051 46.4685 122.469 34.6238 111.721 26.1509C100.973 17.6781 87.6859 13.0704 74 13.0704L74 0Z"
                      />
                      <path
                        className="fill-violet-600"
                        d="M74 0C85.678 1.39258e-07 97.1901 2.76383 107.595 8.06552C118 13.3672 127.003 21.0562 133.867 30.5039C140.731 39.9516 145.262 50.8896 147.089 62.4238C148.916 73.958 147.987 85.7608 144.378 96.8672C140.769 107.974 134.583 118.068 126.326 126.326C118.068 134.583 107.974 140.769 96.8673 144.378C85.7609 147.987 73.9581 148.916 62.4239 147.089C50.8897 145.262 39.9516 140.731 30.5039 133.867L38.2046 123.268C45.9797 128.917 54.9812 132.646 64.4734 134.149C73.9655 135.652 83.6787 134.888 92.8188 131.918C101.959 128.948 110.266 123.858 117.062 117.062C123.858 110.266 128.948 101.959 131.918 92.8187C134.888 83.6786 135.652 73.9655 134.149 64.4733C132.646 54.9812 128.917 45.9796 123.268 38.2046C117.619 30.4296 110.21 24.1019 101.647 19.7388C93.0845 15.3758 83.6105 13.1013 74 13.1013L74 0Z"
                      />
                    </svg>
                    <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-bold text-black">
                      $5,782
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-[1_/_2] row-[-1_/_-3]">
                <img
                  src="https://shadcnblocks.com/images/block/placeholder-4.svg"
                  alt=""
                  className="object-fit size-full rounded-2xl blur-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
