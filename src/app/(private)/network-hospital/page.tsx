"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronLeft,
  Navigation,
  Route,
  Search,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const hospitals = [
  {
    id: 1,
    name: "Methodist Hospital",
    city: "Houston",
    state: "TX",
    rating: 4.9,
    distance_miles: 2.5,
  },
  {
    id: 2,
    name: "UT Medical Center",
    city: "Dallas",
    state: "TX",
    rating: 4.8,
    distance_miles: 1.5,
  },
  {
    id: 3,
    name: "Baylor Medical Center",
    city: "Austin",
    state: "TX",
    rating: 4.5,
    distance_miles: "10.3 Miles",
  },
  {
    id: 4,
    name: "Baylor Lukes Medical",
    city: "Sugarland",
    state: "TX",
    rating: 4.4,
    distance_miles: "11 Miles",
  },

  {
    id: 5,
    name: "Memorial Hospital",
    city: "San Antonio",
    state: "TX",
    rating: 4.1,
    distance_miles: "12 Miles",
  },
  {
    id: 6,
    name: "Ascension Seton Center",
    city: "Temple",
    state: "TX",
    rating: 3.8,
    distance_miles: "1.5 Miles",
  },
  {
    id: 7,
    name: "Baylor Medical Center",
    city: "Fortworth",
    state: "TX",
    rating: 3.5,
    distance_miles: "10.3 Miles",
  },
  {
    id: 8,
    name: "Baylor Lukes Medical",
    city: "The Woodlands",
    state: "TX",
    rating: 3.0,
    distance_miles: "11 Miles",
  },

  {
    id: 9,
    name: "Medical City Center",
    city: "Houston",
    state: "TX",
    rating: 2.9,
    distance_miles: "16 Miles",
  },
  {
    id: 10,
    name: "Baptist Medical Center",
    city: "Dallas",
    state: "TX",
    rating: 2.5,
    distance_miles: "21 Miles",
  },
  {
    id: 11,
    name: "Presbyterian Hospital",
    city: "Austin",
    state: "TX",
    rating: 2.7,
    distance_miles: "25 Miles",
  },
  {
    id: 12,
    name: "Sugar Land Hospital",
    city: "Sugarland",
    state: "TX",
    rating: 2.1,
    distance_miles: "30 Miles",
  },

  {
    id: 13,
    name: "Methodist Hospital",
    city: "Houston",
    state: "TX",
    rating: 4.9,
    distance_miles: "2.5 Miles",
  },
  {
    id: 14,
    name: "UT Medical Center",
    city: "Dallas",
    state: "TX",
    rating: 4.8,
    distance_miles: "1.5 Miles",
  },
  {
    id: 15,
    name: "Baylor Medical Center",
    city: "Austin",
    state: "TX",
    rating: 4.5,
    distance_miles: "10.3 Miles",
  },
  {
    id: 16,
    name: "Baylor Lukes Medical",
    city: "Sugarland",
    state: "TX",
    rating: 4.4,
    distance_miles: "11 Miles",
  },

  {
    id: 17,
    name: "Memorial Hospital",
    city: "San Antonio",
    state: "TX",
    rating: 4.1,
    distance_miles: "12 Miles",
  },
  {
    id: 18,
    name: "Ascension Seton Center",
    city: "Temple",
    state: "TX",
    rating: 3.8,
    distance_miles: "1.5 Miles",
  },
  {
    id: 19,
    name: "Baylor Medical Center",
    city: "Fortworth",
    state: "TX",
    rating: 3.5,
    distance_miles: "10.3 Miles",
  },
  {
    id: 20,
    name: "Baylor Lukes Medical",
    city: "The Woodlands",
    state: "TX",
    rating: 3.0,
    distance_miles: "11 Miles",
  },

  {
    id: 21,
    name: "Medical City Center",
    city: "Houston",
    state: "TX",
    rating: 2.9,
    distance_miles: "16 Miles",
  },
  {
    id: 22,
    name: "Baptist Medical Center",
    city: "Dallas",
    state: "TX",
    rating: 2.5,
    distance_miles: "21 Miles",
  },
  {
    id: 23,
    name: "Presbyterian Hospital",
    city: "Austin",
    state: "TX",
    rating: 2.7,
    distance_miles: "25 Miles",
  },
  {
    id: 24,
    name: "Sugar Land Hospital",
    city: "Sugarland",
    state: "TX",
    rating: 2.1,
    distance_miles: "30 Miles",
  },
];
const NetworkHospitalPage = () => {
  const [selectedValue, setSelectedValue] = React.useState<string>("");
  const [ratings1, setRatings1] = React.useState<boolean>(false);
  const [ratings2, setRatings2] = React.useState<boolean>(false);
  const [ratings3, setRatings3] = React.useState<boolean>(false);
  const [ratings4, setRatings4] = React.useState<boolean>(false);
  const [ratings5, setRatings5] = React.useState<boolean>(false);

  const router = useRouter();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="lg"
          iconOnly
          onClick={() => router.push("/dashboard")}
        >
          <ChevronLeft />
        </Button>

        <h3 className="text-2xl font-bold tracking-4 text-foreground">
          Network Hospitals
        </h3>
      </div>
      <Input
        placeholder="Search for a hospital"
        prefix={<Search />}
        variant="outline"
        size="lg"
      />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold tracking-4 text-accent-foreground">
            150 Matches Found in Texas
          </h4>
          <div className="flex gap-3 items-center">
            <p className="text-base font-medium tracking-4 leading-6 text-accent-foreground">
              Filter by:
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Distance
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={selectedValue}
                  onValueChange={setSelectedValue}
                >
                  <DropdownMenuRadioItem value="option1">
                    Within 5 Miles
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="option2">
                    Within 10 Miles
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="option3">
                    Within 25 Miles
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="option4">
                    Within 50 Miles
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="option5">
                    Within 100 Miles
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Ratings
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
                  checked={ratings1}
                  onCheckedChange={setRatings1}
                >
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={ratings2}
                  onCheckedChange={setRatings2}
                >
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={ratings3}
                  onCheckedChange={setRatings3}
                >
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={ratings4}
                  onCheckedChange={setRatings4}
                >
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={ratings5}
                  onCheckedChange={setRatings5}
                >
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                  <Star className="size-4 fill-[#FF5E00] text-[#FF5E00]" />
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          {hospitals.map((hospital) => (
            <Card key={hospital.name} className="w-full max-w-[354px]">
              <CardHeader className="flex flex-row items-start justify-between gap-3 ">
                <div className="flex flex-col gap-0.5">
                  <CardTitle className="font-semibold">
                    {hospital.name}
                  </CardTitle>
                  <CardDescription className="pt-0">
                    {hospital.city},{hospital.state}
                  </CardDescription>
                </div>
                <div className="bg-accent flex rounded-full px-2 py-1 items-center gap-1 text-base font-medium tracking-4 leading-6 text-accent-foreground">
                  <Star className="size-4 fill-[#ff5e00]  text-[#FF5E00]" />
                  {hospital.rating}
                </div>
              </CardHeader>

              <CardFooter className="flex items-center justify-between ">
                <div className="flex gap-x-1 items-center">
                  <Route className="size-4" />
                  <p className="text-base font-medium tracking-4 leading-6 text-accent-foreground">
                    {hospital.distance_miles}
                  </p>
                </div>
                <div className="flex gap-x-1 items-center">
                  <Navigation className="size-4 text-[#FF5E00]" />
                  <p className="text-base font-medium tracking-4 leading-6 text-accent-foreground">
                    Get Directions
                  </p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkHospitalPage;
