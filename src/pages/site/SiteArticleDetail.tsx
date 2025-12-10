import { useParams } from "react-router-dom";

const SiteArticleDetail = () => {
  const { category, slug } = useParams();
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Article Detail</h1>
        <p className="text-muted-foreground">
          This is the placeholder for /site/articles/{category}/{slug}
        </p>
        <div className="mt-4 p-4 bg-muted rounded-lg inline-block">
          <p className="text-sm">Category: <span className="font-mono">{category}</span></p>
          <p className="text-sm">Slug: <span className="font-mono">{slug}</span></p>
        </div>
      </div>
    </div>
  );
};

export default SiteArticleDetail;
