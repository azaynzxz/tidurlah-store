import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton={true}
      expand={true}
      position="top-center"
      offset={70}
      duration={3500}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border",
          title: "font-semibold text-sm",
          description: "group-[.toast]:text-muted-foreground text-xs mt-1",
          success: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-green-500",
          error: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-red-500",
          warning: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-yellow-500",
          info: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-blue-500",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "!left-auto !right-2 !top-2 !translate-x-0 !translate-y-0 !bg-transparent !border-none !text-muted-foreground hover:!text-foreground hover:!bg-black/5 rounded-md transition-colors",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
