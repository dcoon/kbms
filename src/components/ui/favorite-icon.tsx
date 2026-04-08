
import { List } from '@/components/list/list-item';
import { uilog as log } from '@/services/log/log-service';
import { Favorite, Settings } from '@/services/settings/settings-service';
import { useAtom } from 'jotai/react';
import { TouchableRipple } from 'react-native-paper';


const LOG_SRC = "FavoriteIcon";

interface FavoriteIconProps {
    favorite: Favorite;
}

export function FavoriteIcon({ favorite, }: { favorite: Favorite }) {

    const LOG_PREFIX = "FavoriteIcon";


    const [isFavorite, setIsFavorite] = useAtom(Settings.favorite({ id: favorite.id} as Favorite));
    // const [,toggleFavorite] = useAtom(Settings.toggleFavorite(favorite.id));


    function onFavoritePress() {
        log.info(LOG_PREFIX, "Toggling favorite for device ID: ", favorite.id);
        setIsFavorite(favorite);
    }

    return (
        <TouchableRipple onPress={onFavoritePress} >
            <List.Icon icon={isFavorite ? "heart" : "heart-outline"} />
        </TouchableRipple>
    );
}
