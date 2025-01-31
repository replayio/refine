import React, { ElementType, RefObject } from "react";
import { useButton } from "@react-aria/button";
import { AriaButtonProps } from "react-aria";

export default function Button(props: AriaButtonProps<ElementType> | any) {
    const ref: RefObject<any> = React.useRef();
    const { buttonProps } = useButton(props, ref);

    return (
        <button
            {...buttonProps}
            ref={ref}
            className="flex items-center self-end rounded-lg bg-indigo-500 mb-5 px-5 py-2.5 mt-3 text-center text-sm font-medium text-white hover:bg-indigo-600 sm:w-auto"
        >
            {props.children}
        </button>
    );
}
