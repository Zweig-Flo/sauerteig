import { ExternalLink } from "lucide-react";
import { resolve, type Kind } from "../../shared/kinds.ts";

/** Recipe and care of a kind in a variant, with the page it follows. */
export function RecipeView({ kind, variant }: { kind: Kind; variant?: string | null }) {
  const { recipe, care, source, variantLabel } = resolve(kind, variant);
  return (
    <div className="st-recipe">
      <p className="st-quiet">
        {variantLabel ? `${variantLabel} · ` : ""}
        {recipe.makes}
      </p>
      <table className="st-ingredients">
        <tbody>
          {recipe.ingredients.map((ingredient) => (
            <tr key={ingredient.item}>
              <th scope="row">{ingredient.amount}</th>
              <td>{ingredient.item}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>So geht’s</h3>
      <ol className="st-steps">
        {recipe.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <h3>Pflege</h3>
      <ul className="st-care">
        {care.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <p className="st-quiet st-source">
        In eigenen Worten nach{" "}
        <a href={source.url} target="_blank" rel="noreferrer">
          {source.name} <ExternalLink aria-hidden size={13} />
        </a>
      </p>
    </div>
  );
}
