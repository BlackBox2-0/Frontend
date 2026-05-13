declare module "react-simple-maps" {
  import type { ComponentType, ReactNode, SVGProps } from "react";

  type GeographyObject = {
    rsmKey: string;
    [key: string]: unknown;
  };

  export const ComposableMap: ComponentType<
    SVGProps<SVGSVGElement> & {
      projection?: string;
      projectionConfig?: Record<string, unknown>;
      children?: ReactNode;
    }
  >;

  export const Geographies: ComponentType<{
    geography: string | Record<string, unknown>;
    children: (props: { geographies: GeographyObject[] }) => ReactNode;
  }>;

  export const Geography: ComponentType<
    SVGProps<SVGPathElement> & {
      geography: GeographyObject;
      style?: Record<string, unknown>;
    }
  >;

  export const Marker: ComponentType<
    SVGProps<SVGGElement> & {
      coordinates: [number, number];
      children?: ReactNode;
    }
  >;

  export const Line: ComponentType<
    Omit<SVGProps<SVGPathElement>, "from" | "to"> & {
      from: [number, number];
      to: [number, number];
      coordinates?: Array<[number, number]>;
    }
  >;
}
