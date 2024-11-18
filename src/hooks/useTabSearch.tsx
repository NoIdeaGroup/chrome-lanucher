import { ReactNode, useEffect, useState } from "react";
import { getOpenTabs } from "../actions";
import { Preferences, SearchResult, Tab } from "../interfaces";
import { getPreferenceValues } from "@raycast/api";
import { NOT_INSTALLED_MESSAGE } from "../constants";
import { NotInstalledError, UnknownError } from "../components";
import pinyin from "pinyin";

/**
 * @name useTabSearch
 * @description Filters chrome tabs where the url and title match all tab-or-space-separated words in search query (case insensitive).  Examples given title "foo bar" with url "example.com":
 * @example Given title "foo bar" with url "example.com":
 * search "foo bar" succeeds
 * search "bar foo" succeeds
 * search "foo example" succeds
 * search "example foo" succeds
 * search "foo" succeeds
 * search "example" succeeds
 * search "asdf" fails
 */
export function useTabSearch(query = ""): SearchResult<Tab> & { data: NonNullable<Tab[]> } {
  const { useOriginalFavicon } = getPreferenceValues<Preferences>();
  const [data, setData] = useState<Tab[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorView, setErrorView] = useState<ReactNode | undefined>();
  const queryParts = query.toLowerCase().split(/\s+/);

  const getSearchableStr = (tab: Tab) => {
    try {
      const pinyinData: Array<Array<string>> = pinyin(tab.title, { style: 0, group: false, compact: true });
      const finalPinyinStr = pinyinData[0].join("")
      return `${tab.title.toLowerCase()} ${tab.urlWithoutScheme().toLowerCase()} ${finalPinyinStr}`;
    } catch (e) {
      console.error(e)
      return `${tab.title.toLowerCase()} ${tab.urlWithoutScheme().toLowerCase()}`;
    }
  };

  useEffect(() => {
    getOpenTabs(useOriginalFavicon)
      .then((tabs) =>
        tabs
          .map((tab): [Tab, string] => [tab, getSearchableStr(tab)])
          .filter(([, searchable]) => queryParts.reduce((isMatch, part) => isMatch && searchable.includes(part), true))
          .map(([tab]) => tab)
      )
      .then(setData)
      .then(() => setIsLoading(false))
      .catch((e) => {
        if (e.message === NOT_INSTALLED_MESSAGE) {
          setErrorView(<NotInstalledError />);
        } else {
          setErrorView(<UnknownError />);
        }
        setIsLoading(false);
      });
  }, [query]);

  return { data, isLoading, errorView };
}
