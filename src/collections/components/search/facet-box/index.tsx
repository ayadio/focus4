import i18next from "i18next";
import {observer} from "mobx-react";
import * as React from "react";

import {themr} from "../../../../theme";

import {SearchStore} from "../../../store";
import {Facet, FacetStyle} from "./facet";
import {addFacetValue, removeFacetValue, shouldDisplayFacet} from "./utils";
export {addFacetValue, removeFacetValue, shouldDisplayFacet, FacetStyle};

import * as styles from "./__style__/facet-box.css";
export type FacetBoxStyle = Partial<typeof styles>;
const Theme = themr("facetBox", styles);

/** Props de la FacetBox. */
export interface FacetBoxProps<T> {
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nombre de valeurs de facettes affichées. Par défaut : 6 */
    nbDefaultDataList?: number;
    /** Affiche les facettes qui n'ont qu'une seule valeur. */
    showSingleValuedFacets?: boolean;
    /** Store de recherche associé. */
    store: SearchStore<T>;
    /** CSS. */
    theme?: FacetBoxStyle;
}

/** Composant contenant la liste des facettes retournées par une recherche. */
@observer
export class FacetBox<T> extends React.Component<FacetBoxProps<T>> {
    render() {
        const {i18nPrefix = "focus", nbDefaultDataList = 6, showSingleValuedFacets, store} = this.props;
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <div className={theme.facetBox}>
                        <h3>{i18next.t(`${i18nPrefix}.search.facets.title`)}</h3>
                        {store.facets
                            .filter(facet =>
                                shouldDisplayFacet(
                                    facet,
                                    store.selectedFacets,
                                    showSingleValuedFacets,
                                    store.totalCount
                                )
                            )
                            .map(facet => {
                                if (store.selectedFacets[facet.code] || Object.keys(facet).length > 1) {
                                    return (
                                        <Facet
                                            key={facet.code}
                                            facet={facet}
                                            i18nPrefix={i18nPrefix}
                                            nbDefaultDataList={nbDefaultDataList}
                                            store={store}
                                        />
                                    );
                                } else {
                                    return null;
                                }
                            })}
                    </div>
                )}
            </Theme>
        );
    }
}
