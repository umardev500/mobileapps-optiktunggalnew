import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors, shadows, wrapper } from '../../lib/styles';
import { ReviewModel } from '../../types/model';
import { RatingStars, Typography } from '../../ui-shared/components';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = ViewProps & {
  review: ReviewModel;
};

function ReviewItem({
  review,
  style,
  ...props
}: Props) {
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.user}>
<<<<<<< HEAD
        <Typography size="md" style={{ flex: 1, marginHorizontal: -10, fontWeight: 'bold' }}>
=======
        <Typography size="md" style={{ flex: 1, marginHorizontal: -10, fontSize: 12, fontWeight: 'bold' }}>
>>>>>>> origin/Develop
          {review.nama || review.name}
        </Typography>

        <RatingStars
          size={18}
          value={review.star || review.rating}
          icons={['star', 'star-outline']}
        />
      </View>

<<<<<<< HEAD
      <Typography style={{ paddingBottom: 15, textAlign: 'justify' }} numberOfLines={3}>
=======
      <Typography style={{ paddingBottom: 5, textAlign: 'justify', fontSize: 11 }} numberOfLines={3}>
>>>>>>> origin/Develop
        {review.remark || review.content}
      </Typography>

      {!review.replies?.length ? null : (
        <View style={{ paddingBottom: 15 }}>
          {review.replies.map((item, index) => (
            <View key={index} style={styles.reply}>
              <Typography heading size="sm" color="primary">
                {item.nama || item.name}
              </Typography>

              <Typography style={styles.replyContent}>
                {item.remark || item.content}
              </Typography>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.borderTop, {
                    borderColor: colors.gray[400],
                    marginVertical: 5,
                  }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
<<<<<<< HEAD
    paddingHorizontal: 15,
=======
    paddingHorizontal: 10,
>>>>>>> origin/Develop
  },
  borderTop: {
    borderTopWidth: 1,
    borderColor: '#333333',
  },
  user: {
    ...wrapper.row,
    alignItems: 'center',
    paddingVertical: 12,
<<<<<<< HEAD
    paddingHorizontal: 8,
=======
    paddingHorizontal: 10,
>>>>>>> origin/Develop
  },
  reply: {

  },
  replyContent: {
    marginLeft: 40,
    paddingLeft: 12,
    paddingHorizontal: 4,
    borderLeftWidth: 2,
    borderColor: colors.palettes.primary,
  },
});

export default ReviewItem;
