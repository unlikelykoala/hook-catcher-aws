import invertocat from "@/assets/GitHub_Invertocat_Black.svg"

type GitHubLinkProps = {
  url: string
  altText?: string
  className?: string
}

export default function GitHubLink({
  url,
  altText = "GitHub logo",
  className,
}: GitHubLinkProps) {
  return (
    <a href={url} aria-label="Visit the GitHub repository" className={className}>
      <img
        src={invertocat}
        alt={altText}
        className="transition-all dark:invert dark:brightness-125"
      />
    </a>
  )
}
