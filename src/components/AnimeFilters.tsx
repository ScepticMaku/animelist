import { DocumentNode, gql, OperationVariables, TypedDocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import slugify from 'slugify';
import { EMPTY_QUERY } from "../config/queryConfig";
import { useDebounce } from "./UseDebounce";

interface AnimeFiltersProps {
  query?: DocumentNode;
  label: string;
  filterType?: 'genre' | 'year' | 'season' | 'format' | 'airing-status';
  canSearch?: boolean;
  onValueChange?: (value: string | string[] | null | number) => void;
  isMulti?: boolean;
  setSelectedValue?: any;
}

interface queryData {
  GenreCollection: [string],
}

export function AnimeFilters({ query, label, filterType, canSearch, onValueChange, isMulti, setSelectedValue }: AnimeFiltersProps) {

  const [value, setValue] = useState<any>(isMulti ? [] : null);
  const [isFocus, setIsFocus] = useState(false);

  const hasValue = isMulti ? value && value.length > 0 : value !== null;
  const debounceQuery = useDebounce(query, 500);

  const seasons = [
    "Fall",
    "Summer",
    "Spring",
    "Winter"
  ];

  const formats = [
    "TV Show",
    "Movie",
    "TV Short",
    "Special",
    "OVA",
    "ONA",
    "Music"
  ];

  const airingStatuses = [
    "Airing",
    "Finished",
    "Not Yet Aired",
    "Cancelled"
  ]

  const renderLabel = () => {
    return (
      <Text>
        {label}
      </Text>
    );
  };

  const slug = (text: string) => {
    return slugify(text, {
      replacement: '-',
      lower: true
    });
  }

  const { data } = useQuery<queryData>(debounceQuery || EMPTY_QUERY, {
    skip: !debounceQuery || filterType !== 'genre'
  });

  const currentYear = new Date().getFullYear() + 1;

  const dataItems = useMemo(() => {
    if (filterType === 'genre' && data?.GenreCollection) {
      return data.GenreCollection.map((genre) => ({
        label: genre,
        value: slug(genre)
      }));
    }

    if (filterType === 'year') {
      return Array.from(
        { length: currentYear - 1940 + 1 },
        (_, i) => ({
          label: (currentYear - i).toString(),
          value: (currentYear - i)
        })
      );
    }

    if (filterType === 'season') {
      return seasons.map((season) => ({
        label: season,
        value: season.toUpperCase()
      }));
    }

    if (filterType === 'format') {
      return formats.map((format) => ({
        label: format,
        value: format.toUpperCase().replace(/ /g, '_')
      }));
    }

    if (filterType === 'airing-status') {
      return airingStatuses.map((status) => ({
        label: status,
        value: status.toUpperCase().replace(/ /g, '_'),
      }));
    }

    return [];
  }, [filterType, data]);

  const handleClear = () => {
    const resetValue = isMulti ? [] : null;
    setValue(resetValue);
    onValueChange?.(resetValue);
  };



  return (
    <View style={Styles.container}>
      {renderLabel()}
      {isMulti ? (
        <MultiSelect
          style={[Styles.multiselect, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={Styles.placeholderStyle}
          selectedTextStyle={Styles.selectedTextStyle}
          inputSearchStyle={Styles.inputSearchStyle}
          iconStyle={Styles.iconStyle}
          data={dataItems}
          search={canSearch}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select"
          searchPlaceholder="Search..."
          value={value} // This expects an array: ['action', 'adventure']
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item);
            onValueChange?.(item);
          }}
          renderRightIcon={() => (
            hasValue ? (
              <Ionicons onPress={handleClear} name="close-outline" size={26} style={{ paddingLeft: 10 }} />
            ) : (
              <Ionicons name="chevron-down-outline" size={20} style={{ paddingLeft: 10 }} />
            )
          )}
        />
      ) : (
        <Dropdown
          style={[Styles.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={Styles.placeholderStyle}
          selectedTextStyle={Styles.selectedTextStyle}
          inputSearchStyle={Styles.inputSearchStyle}
          iconStyle={Styles.iconStyle}
          data={dataItems}
          search={canSearch}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select"
          searchPlaceholder="Search..."
          value={setSelectedValue ? setSelectedValue : value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item.value);
            setIsFocus(false);
            onValueChange?.(item.value);
          }}
          renderRightIcon={() => (
            (hasValue || setSelectedValue) ? (
              <Ionicons onPress={handleClear} name="close-outline" size={26} style={{ paddingLeft: 10 }} />
            ) : (
              <Ionicons name="chevron-down-outline" size={20} style={{ paddingLeft: 10 }} />
            )
          )}
        />
      )}
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  multiselect: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
